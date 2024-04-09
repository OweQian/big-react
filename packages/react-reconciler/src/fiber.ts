import type { Key, Props, Ref } from 'shared/ReactTypes';
import type { WorkTag } from './workTags';
import { NoFlags, type Flags } from './fiberFlags';

export class FiberNode {
	type: any;
	tag: WorkTag;
	pendingProps: any;
	key: Key;
	stateNode: any; // DOM
	ref: Ref;

	return: FiberNode | null;
	sibling: FiberNode | null;
	child: FiberNode | null;
	index: number;

	memoizedProps: Props | null;
	alternate: FiberNode | null;
	flags: Flags;

	constructor(tag: WorkTag, pendingProps: Props, key: Key) {
		// 实例
		// 组件类型
		this.tag = tag;
		// key
		this.key = key;
		//fiberNode 对应的元素
		// HostComponent <div> div DOM
		this.stateNode = null;
		// FunctionComponent 指函数本身
		// ClassComponent 指 class
		// HostComponent 指 DOM tagName(小写)
		this.type = null;

		// 作为树状结构
		this.return = null;
		this.sibling = null;
		this.child = null;
		this.index = 0;

		this.ref = null;

		// 作为工作单元
		this.pendingProps = pendingProps;
		this.memoizedProps = null;

		// 指向另一个缓冲区中对应的 fiberNode
		// current.alternate === workInProgress
		// workInProgress.alternate === current
		this.alternate = null;
		// 副作用
		this.flags = NoFlags;
	}
}
