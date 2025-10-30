import { userTypeDefs } from "../modules/users/user.schema";
import { authTypeDefs } from "../modules/auth/auth.schema";
import { taskTypeDefs } from "../modules/tasks/task.schema";

export const schema = [userTypeDefs, authTypeDefs, taskTypeDefs];

export default schema;
