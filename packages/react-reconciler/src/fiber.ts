import type { Key, Props, Ref } from 'shared/ReactTypes';
import type { WorkTag } from './workTags';
import { NoFlags, type Flags } from './fiberFlags';
import { Container } from 'hostConfig';

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
	memoizedState: any;
	alternate: FiberNode | null;
	flags: Flags;

	updateQueue: unknown;

	// 构造函数
	constructor(tag: WorkTag, pendingProps: Props, key: Key) {
		// 作为 "静态的数据结构"
		// 对应的组件类型 FunctionComponent/HostRoot/HostComponent...
		this.tag = tag;
		// key
		this.key = key;
		// FunctionComponent 指函数本身、ClassComponent 指 class、HostComponent 指 DOM tagName(小写)
		this.type = null;
		// FiberNode 对应的元素 FunctionComponent 对应 DOM 元素
		this.stateNode = null;

		// 作为树状结构
		/**
		 * 指向父 FiberNode
		 * 为什么叫作 return 而不是 parent 或 father?
		 * 作为一个 "动态的工作单元"，return 指 "FiberNode 执行完 completeWork 后返回的下一个 FiberNode"
		 */
		this.return = null;
		// 指向右边的兄弟 FiberNode
		this.sibling = null;
		// 指向第一个子 FiberNode
		this.child = null;
		this.index = 0;

		this.ref = null;

		// 作为 "动态的工作单元"
		// 副作用
		this.flags = NoFlags;
		this.updateQueue = null;

		this.pendingProps = pendingProps;
		this.memoizedProps = null;
		this.memoizedState = null;

		// 指向另一个缓冲区中对应的 FiberNode
		// current.alternate === workInProgress
		// workInProgress.alternate === current
		this.alternate = null;
	}
}

/**
 * FiberRootNode
 * HostRootFiber(: 根节点
 * FiberRootNode.current === HostRootFiber
 * HostRootFiber.stateNode === FiberRootNode
 *
 */
export class FiberRootNode {
	container: Container; // 挂载容器
	current: FiberNode; // 指向 hostRootFiber
	finishedWork: FiberNode | null; // 指向递归已经完成的 hostRootFiber
	constructor(container: Container, hostRootFiber: FiberNode) {
		this.container = container;
		this.current = hostRootFiber;
		hostRootFiber.stateNode = this;
		this.finishedWork = null;
	}
}

export const createWorkInProgress = (
	current: FiberNode,
	pendingProps: Props
): FiberNode => {
	// 生成 WorkInProgress FiberNode 时会复用 Current Fiber Tree 中的同级节点
	let wip = current.alternate;
	if (wip === null) {
		// mount - 首屏渲染 - 创建 WorkInProgress Tree 中的 HostRootFiber
		wip = new FiberNode(current.tag, pendingProps, current.key);
		wip.stateNode = current.stateNode;

		// alternate 链接 Current HostRootFiber 和 WorkInProgress HostRootFiber
		wip.alternate = current;
		current.alternate = wip;
	} else {
		// update - 更新
		// 更新 pendingProps
		wip.pendingProps = pendingProps;
		// 清除以前的副作用
		wip.flags = NoFlags;
	}
	wip.type = current.type;
	wip.updateQueue = current.updateQueue;
	wip.memoizedProps = current.memoizedProps;
	wip.memoizedState = current.memoizedState;
	return wip;
};
