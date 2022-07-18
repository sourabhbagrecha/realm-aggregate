import realm from 'realm'
import sift from 'sift'

const aggregate = (aggregationPipeline: any[], realm: realm, model: string ) => {
	let data = realm.objects(model).toJSON()
	aggregationPipeline.forEach((aggregation) => {
		data = applyAggregation(aggregation, data)
	})
	return data
}

const applyAggregation = (aggregation: any, data: any) => {
	for( const stage in aggregation){
		const query = aggregation[stage]
		switch(stage){
			case '$match': return applyMatchStage(query, data)
			default: {
				throw new Error(`The stage parameter ${stage} has no implementation.`)
			}
		}
	}
}

const applyMatchStage = (query: any, data: any) => {
	return data.filter(sift(query))
}

export {aggregate}
