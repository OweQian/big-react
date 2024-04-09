export type Flags = number;

export const NoFlags = 0b0000001;
// 插入或移动
export const Placement = 0b0000010;
// 更新
export const Update = 0b0000100;
// 删除
export const ChildDeletion = 0b0001000;
