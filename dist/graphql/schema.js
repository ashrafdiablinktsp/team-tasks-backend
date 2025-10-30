"use strict";
const { userTypeDefs } = require('../modules/users/user.schema.js');
const { authTypeDefs } = require('../modules/auth/auth.schema.js');
const userSDL = typeof userTypeDefs === 'string' ? userTypeDefs : userTypeDefs.loc?.source.body;
const authSDL = typeof authTypeDefs === 'string' ? authTypeDefs : authTypeDefs.loc?.source.body;
const schema = [userSDL, authSDL].filter(Boolean).join('\n');
module.exports = { schema };
//# sourceMappingURL=schema.js.map