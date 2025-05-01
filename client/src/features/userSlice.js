import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: [],
  reducers: {
    loginUser(state, action) {},
    logoutUser(state, action) {},
    updateUser(state, action) {},
  },
});

export const { loginUser, logoutUser, updateUser } = todosSlice.actions;
export default userSlice.reducer;
