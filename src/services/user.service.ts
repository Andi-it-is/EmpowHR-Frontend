import api from "@/lib/axios";

interface SimpleUserObject {
  id: string,
  firstname: string,
  lastname: string,
  email: string,
}

async function getSimpleUserInfo(): Promise<SimpleUserObject> {

  const result = await (await api.get("/user/simple")).data.data
  return result
}


export const userService = {
  getSimpleUserInfo
}