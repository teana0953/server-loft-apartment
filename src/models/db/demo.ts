import Mongoose, { Model, Document, Schema } from 'mongoose';
import { IMongooseBase } from '../base';

export enum EDemoDifficulty {
    easy = 'easy',
    medium = 'medium',
    difficult = 'difficult',
}

export interface IDemo extends IMongooseBase {
    name: string;
    duration: number;
    maxGroupSize: number;
    difficulty: EDemoDifficulty;
    ratingsAverage?: number;
    ratingsQuantity?: number;
    price: number;
    priceDiscount?: number;
    summary: string;
    description?: string;
}

export interface DemoDocument extends IDemo, Document {}

export interface DemoModel extends Model<DemoDocument> {}

const demoSchema: Schema<DemoDocument> = new Mongoose.Schema<DemoDocument>(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: true,
            trim: true,
            maxlength: [40, 'A tour name must have less or equal then 40 characters'],
            minlength: [10, 'A tour name must have more or equal then 10 characters'],
        },
        duration: {
            type: Number,
            required: [true, 'A tour must have a duration'],
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have a group size'],
        },
        difficulty: {
            type: String,
            required: [true, 'A tour must have a difficulty'],
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'Difficulty is either: easy, medium, difficult',
            },
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, 'Rating must be above 1.0'],
            max: [5, 'Rating must be below 5.0'],
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price'],
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (val) {
                    // this only points to current doc on NEW document creation
                    return val < this.price;
                },
                message: 'Discount price ({VALUE}) should be below regular price',
            },
        },
        summary: {
            type: String,
            trim: true,
            required: [true, 'A tour must have a description'],
        },
        description: {
            type: String,
            trim: true,
        },
    },
    {
        collection: 'Demo',
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true,
    },
);

demoSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
// tourSchema.pre('save', function(next) {
//   console.log('Will save document...');
//   next();
// });

// QUERY MIDDLEWARE
// tourSchema.pre('find', function(next) {
demoSchema.pre<DemoDocument & DemoModel>(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });

    (this as any).start = Date.now();
    next();
});

demoSchema.post(/^find/, function (docs, next) {
    console.log(`Query took ${Date.now() - (this as any).start} milliseconds!`);
    next();
});

export const Demo = Mongoose.model<DemoDocument, DemoModel>('Demo', demoSchema);
