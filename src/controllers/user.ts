import { Request, Response } from 'express';
import { Controller } from '.';
import { IDB, IResponse, IRequest, IResponseBase, IRequestBase } from '../models';
import { FileMongoHelper, PhotoHelper, QueryHelper } from '../helpers';
import { UpdateQuery } from 'mongoose';
import { ObjectId } from 'mongodb';
import { validationResult } from 'express-validator';

export { updateMe, addGroup, getGroups, updateGroup, deleteGroup };

const UserPhotoCollectionName = 'FileUserPhoto';

/**
 * Update me
 */
export type InputUpdateMe = IRequest.IUser.IUserMe;
export type OutputUpdateMe = IResponseBase<IResponse.IAuth.ISignup>;
const updateMe = new Controller<InputUpdateMe, OutputUpdateMe>(async (req, res) => {
    let input = req.body;

    let updateQuery: UpdateQuery<IDB.UserDocument> = {
        name: input.name,
    };

    let photoOriginalUrl: string = undefined;
    let photoUrl: string = undefined;
    if (req.file) {
        photoOriginalUrl = await savePhoto(req.file.buffer, req.user.photoOriginalUrl);

        req.file.buffer = await PhotoHelper.resize(req.file.buffer, {
            format: 'jpeg',
            height: 120,
            width: 120,
        });
        photoUrl = await savePhoto(req.file.buffer, req.user.photoUrl);

        updateQuery = {
            ...updateQuery,
            photoUrl: photoUrl,
            photoOriginalUrl: photoOriginalUrl,
        };
    }

    let user = await IDB.User.findByIdAndUpdate(req.user.id, updateQuery, {
        new: true,
        runValidators: true,
    });

    res.json({
        status: 'ok',
        data: {
            id: user.id,
            name: user.name,
            email: user.email,
            friends: user.friends,
            groups: user.groups,
            role: user.role,
            photoUrl: user.photoUrl,
            photoOriginalUrl: user.photoOriginalUrl,
        },
    });
}).func;

/**
 * save photo
 * @param buffer
 * @param url
 * @returns
 */
export async function savePhoto(buffer: Buffer, url: string): Promise<string> {
    let photoId: string = undefined;
    if (url) {
        photoId = (await FileMongoHelper.parseSrc(url)).id;
    }

    return await FileMongoHelper.saveFile(buffer, UserPhotoCollectionName, photoId);
}

/**
 * Add Group
 */
type InputAddGroup = IRequest.IUser.IAddGroup;
type OutputAddGroup = IResponseBase<IResponse.IAuth.ISignup>;
const addGroup = new Controller<InputAddGroup, OutputAddGroup>(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw errors;
    }

    let input = req.body;
    let user = req.user;

    // get users in userIds
    let users = await IDB.User.find({ _id: { $in: input.userIds } });

    // update userIds
    input.userIds = users.map((user) => user.id);

    let group = await IDB.Group.create({
        name: input.name,
        userIds: input.userIds,
        createdUserId: user.id,
    });

    // update users groups
    await Promise.all(
        users.map(async (user) => {
            user.groups.push({
                id: group.id,
            });
            await user.save({ validateBeforeSave: false });
        }),
    );

    res.json({
        status: 'ok',
        data: {
            id: user.id,
            name: user.name,
            email: user.email,
            friends: user.friends,
            groups: user.groups,
            photoUrl: user.photoUrl,
            photoOriginalUrl: user.photoOriginalUrl,
            role: user.role,
        },
    });
}).func;

/**
 * Get groups
 */
type InputGetGroup = IRequestBase;
type OutputGetGroup = IResponseBase<IResponse.IUser.IGroup[]>;
const getGroups = new Controller<InputGetGroup, OutputGetGroup>(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw errors;
    }

    let input = req.params;
    let user = req.user;
    let groupIds = user.groups.map((item) => new ObjectId(item.id));

    let oriQuery = IDB.Group.find({ _id: { $in: groupIds } });
    let queryService = await new QueryHelper<IDB.GroupDocument[], IDB.GroupDocument>(IDB.Group.find({ _id: { $in: groupIds } }), req.query);
    let total: number = await oriQuery.countDocuments();

    queryService = queryService //
        .sort()
        .paginate();

    let result = await queryService.query;

    res.json({
        status: 'ok',
        total: total,
        page: queryService.page,
        limit: queryService.limit,
        data: result.map((item) => {
            return {
                id: item.id,
                name: item.name,
                userIds: item.userIds,
                createdUserId: item.createdUserId,
            };
        }),
    });
}).func;

/**
 * Update Group
 */
type InputUpdateGroup = IRequest.IUser.IUpdateGroup;
type OutputUpdateGroup = IResponseBase<IResponse.IAuth.ISignup>;
const updateGroup = new Controller<InputUpdateGroup, OutputUpdateGroup>(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw errors;
    }

    console.log(req.body);

    let input = req.body;
    let user = req.user;

    let group = await IDB.Group.findOne({
        _id: new ObjectId(input.id),
    });

    // get users which have this group
    let needDeleteUsers = await IDB.User.find({ 'groups.id': { $in: [input.id] } });
    await Promise.all(
        needDeleteUsers.map(async (user) => {
            user.groups = user.groups.filter((group) => group.id !== input.id);
            await user.save({ validateBeforeSave: false });
        }),
    );

    // get users in userIds
    let users = await IDB.User.find({ _id: { $in: input.userIds } });

    // update userIds
    input.userIds = users.map((user) => user.id);

    // update users groups
    await Promise.all(
        users.map(async (user) => {
            user.groups.push({
                id: group.id,
            });
            await user.save({ validateBeforeSave: false });
        }),
    );

    // update group self
    group.name = input.name;
    group.userIds = input.userIds;
    await group.save();

    res.json({
        status: 'ok',
        data: {
            id: user.id,
            name: user.name,
            email: user.email,
            friends: user.friends,
            groups: user.groups,
            photoUrl: user.photoUrl,
            photoOriginalUrl: user.photoOriginalUrl,
            role: user.role,
        },
    });
}).func;

/**
 * Delete Group
 */
type InputDeleteGroup = IRequest.IUser.IUpdateGroup;
type OutpuDeleteGroup = IResponseBase<IResponse.IAuth.ISignup>;
const deleteGroup = new Controller<InputDeleteGroup, OutpuDeleteGroup>(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw errors;
    }

    let input = req.params;
    let user = req.user;

    // get users which have this group
    let needDeleteUsers = await IDB.User.find({ 'groups.id': { $in: [input.id] } });
    await Promise.all(
        needDeleteUsers.map(async (user) => {
            user.groups = user.groups.filter((group) => group.id !== input.id);
            await user.save({ validateBeforeSave: false });
        }),
    );

    let group = await IDB.Group.deleteOne({
        _id: new ObjectId(input.id),
    });

    res.json({
        status: 'ok',
        data: {
            id: user.id,
            name: user.name,
            email: user.email,
            friends: user.friends,
            groups: user.groups,
            photoUrl: user.photoUrl,
            photoOriginalUrl: user.photoOriginalUrl,
            role: user.role,
        },
    });
}).func;
