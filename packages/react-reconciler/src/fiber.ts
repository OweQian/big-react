import type { Key, Props, ReactElementType, Ref } from 'shared/ReactTypes';
import { FunctionComponent, HostComponent, type WorkTag } from './workTags';
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
 * HostRootFiber
 * FiberRootNode.current === HostRootFiber
 * HostRootFiber.stateNode === FiberRootNode
 *
 */
export class FiberRootNode {
	container: Container;
	current: FiberNode;
	finishedWork: FiberNode | null;
	constructor(container: Container, hostRootFiber: FiberNode) {
		// 挂载容器
		this.container = container;
		// 指向 HostRootFiber
		this.current = hostRootFiber;
		hostRootFiber.stateNode = this;
		// 指向递归已经完成的 HostRootFiber
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
		// mount - 首屏渲染
		wip = new FiberNode(current.tag, pendingProps, current.key);
		wip.stateNode = current.stateNode;

		// alternate 连接 Current FiberNode 和 WorkInProgress FiberNode
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

export function createFiberFromElement(element: ReactElementType): FiberNode {
	const { type, key, props } = element;
	// 默认 FunctionComponent
	let fiberTag: WorkTag = FunctionComponent;

	if (typeof type === 'string') {
		// <div/> type: 'div'
		fiberTag = HostComponent;
	} else if (typeof type !== 'function' && __DEV__) {
		console.warn('未定义的type类型', element);
	}
	const fiber = new FiberNode(fiberTag, props, key);
	fiber.type = type;
	return fiber;
}
