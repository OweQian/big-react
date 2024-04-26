// 递归中的递阶段

import { mountChildFibers, reconcileChildFibers } from './childFibers';
import { FiberNode } from './fiber';
import { UpdateQueue, processUpdateQueue } from './updateQueue';
import { HostComponent, HostRoot, HostText } from './workTags';
import { ReactElementType } from 'shared/ReactTypes';

export const beginWork = (wip: FiberNode) => {
	// 比较，返回子 FiberNode
	switch (wip.tag) {
		case HostRoot:
			return updateHostRoot(wip);
		case HostComponent:
			return updateHostComponent(wip);
		case HostText:
			return null;
		default:
			if (__DEV__) {
				console.warn('beginWork 未实现的类型');
			}
			break;
	}
};

// wip === HostRoot
function updateHostRoot(wip: FiberNode) {
	const baseState = wip.memoizedState;
	const updateQueue = wip.updateQueue as UpdateQueue<Element>;

	const pending = updateQueue.shared.pending;
	// 挂载 - 置空
	updateQueue.shared.pending = null;

	// 参考 updateContainer 方法
	const { memoizedState } = processUpdateQueue(baseState, pending);

	wip.memoizedState = memoizedState;
	// ReactElement -> <App/>
	const nextChildren = wip.memoizedState;
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

function updateHostComponent(wip: FiberNode) {
	const nextProps = wip.pendingProps;
	// 从 pendingProps 中取，即 wip.peningProps.children，
	const nextChildren = nextProps.children;
	reconcileChildren(wip, nextChildren);
	return wip.child;
}

function reconcileChildren(wip: FiberNode, children?: ReactElementType) {
	const current = wip.alternate;
	if (current !== null) {
		// update
		wip.child = reconcileChildFibers(wip, current?.child, children);
	} else {
		// mount
		wip.child = mountChildFibers(wip, null, children);
	}
}
