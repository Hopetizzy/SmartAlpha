const schemas = require('../node_modules/@insforge/shared-schemas/dist/index.js');
let portalRes = schemas.createCustomerPortalSessionResponseSchema;
while (portalRes && portalRes._def && portalRes._def.schema) {
  portalRes = portalRes._def.schema;
}
console.log('portalRes shape:', Object.keys(portalRes.shape));
if (portalRes.shape.customerPortalSession) {
  let inner = portalRes.shape.customerPortalSession;
  while (inner && inner._def && inner._def.schema) {
    inner = inner._def.schema;
  }
  console.log('inner shape:', Object.keys(inner.shape));
}
