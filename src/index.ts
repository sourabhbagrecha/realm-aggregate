import realm from 'realm'
import sift from 'sift'

const aggregate = (aggregate: any[], realm: realm, model: string ) => {
	return aggregate.reduce((prevVal, curVal, index, array) => {
		return applyAggregation(array[index], prevVal);
	},realm.objects(model).toJSON())
}

const applyAggregation = (aggregation: any, data: any) => {
	for( const stage in aggregation){
		const query = aggregation[stage]
		switch(stage){
			case '$match': return applyMatchStage(query, data)
			default: {
				console.warn("stage not implemented: ", stage)
				return data
			}
		}
	}
}

const applyMatchStage = (query: any, data: any) => {
	return data.filter(sift(query))
}

export {aggregate}
