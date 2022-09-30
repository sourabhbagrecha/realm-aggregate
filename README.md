# Realm Aggregate
A JavaScript library for React Native based mobile apps that brings offline analytics capabilities on top of data provided by Realm JS SDK. 

## Why this project?
When I was building my first React Native based expense-manager using Atlas Device Sync, I came up with an idea for a new feature where I wanted to perform analytics on the data stored on the user’s device.
Though Realm SDKs provide all the features I needed to build an offline-first Mobile App, I was really surprised when I learned that Realm SDK does not provide my favorite MongoDB feature: Aggregation Pipelines.

## What are the alternative?
AFAIK, there are two alternatives to address this:
The first is to use Atlas App Services’ Functions to execute aggregation pipelines over their MongoDB Database Deployment on Atlas. But that’s limited to internet connectivity, if there’s no internet connection, then no functions can be triggered.
Alternatively, App Developers can write their own analytics logic to process and transform data. Giving developers the ability to process & transform documents in a step-by-step manner will not only increase their productivity but will also allow them to focus on the features that are unique to their app instead of wasting their time on writing logic to process data while ensuring efficiency.

## What did we build?
Therefore, for my Skunkworks (an Internal Week-long Hackathon), I couldn’t think of a better project than to bring these analytical capabilities to the Realm SDK so that we can perform analytics even when there’s no internet.
So, to bring this idea to life I teamed up with @Andrew_Meyer, who is one of the top contributors of our Atlas Device Sync’s Realm SDK for React Native.

Basically, we created JavaScript a library that can be installed using npm. This library will act as a bridge between our Realm SDK and the capabilities for a developer to perform analytics and get insights from the data stored on the user’s device.

![image](https://user-images.githubusercontent.com/27056663/193196067-d4d1b7c9-1094-43d3-96bd-d3673d7f9f7c.png)

Given that we already know the input and the expectations from this library, we chose a Test Driven Development approach.

The current MongoDB aggregation framework has more than 150 expressions and 30 stages. But we could not cover everything in these 5 days. Therefore, we started with the most common and fundamental stages and operators:

## Aggregation Pipeline’s Building Blocks
### Supported Stages

* $match
* $group
* $project
* $addFields
* $sort
* $limit
* $skip

### Supported Accumulators
* $sum
* $avg
* $min
* $max
* $push

### Supported Operators
* $add 
* $subtract
* $multiply
* $divide

## How to use it in your projects?
The first step is to install our package in your application. All you need to do is run this command:
```bash
npm i realm-aggregate
```
The next step is to pass your aggregation pipeline along with an Array of JavaScript Objects on which you want to perform aggregation, like this:


```javascript
import {aggregate} from “realm-aggregate”;
import {createRealmContext} from '@realm/react';

const expenseSchema = {
  name: 'expense',
  properties: {
    _id: 'objectId?',
    amount: 'int?',
    author: 'objectId?',
    category: 'string?',
    createdAt: 'date?',
    mode: 'string?',
    title: 'string?',
  },
  primaryKey: '_id',
};


const {RealmProvider, useRealm, useQuery, useObject} = createRealmContext({
  schema: [expenseSchema],
});

const results = aggregate(yourAggregationPipeline, yourArrayOfObjects)
  const expenses = useQuery('expense');

  const groupExpensesOnBasisOfModes = useCallback(() => {
    const pipeline = [
      {$group: {_id: '$mode', totalAmount: {$sum: '$amount'}}},
      {$project: {mode: '$_id', totalAmount: '$totalAmount'}},
      {$sort: {totalAmount: -1}},
    ];
    return aggregate(pipeline, expenses);
  }, [expenses]);

  const modeAnalytics = useMemo(() => {
    return groupExpensesOnBasisOfModes();
    // modesData=
    // [
    //   {mode: 'Cheque', totalAmount: 3000},
    //   {mode: 'UPI', totalAmount: 1390},
    //   {mode: 'Credit Card', totalAmount: 1280},
    //   {mode: 'Axis CC', totalAmount: 1200},
    //   {mode: 'Axis Savings A/c', totalAmount: 900},
    //   {mode: 'Cash', totalAmount: 320},
    //   {mode: 'Demo', totalAmount: 2},
    // ];
  }, [groupExpensesOnBasisOfModes]);

```

## Wanna take a look at a real-world example?
Check out this [Analytics Screen](https://github.com/sourabhbagrecha/expengo-mobile/blob/main/screens/Analytics.js) I implemented for my React Native based expense manager for Android & iOS.

https://www.npmjs.com/package/realm-aggregate

