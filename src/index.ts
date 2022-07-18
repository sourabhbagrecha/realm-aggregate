import realm from 'realm'

const aggregate = (aggregate: any[], realm: realm, model: string ) => {

	return realm.objects(model).toJSON()
}

export {aggregate}
