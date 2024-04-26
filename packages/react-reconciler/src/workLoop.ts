import { beginWork } from './beginWork';
import { completeWork } from './completeWork';
import { FiberNode, FiberRootNode, createWorkInProgress } from './fiber';
import { HostRoot } from './workTags';

// 全局变量 workInProgress
let workInProgress: FiberNode | null = null;

// 挂载：workInProgress === HostRootFiber
function prepareFreshStack(root: FiberRootNode) {
	// 通过 Current Fiber Tree 中的同级 FiberNode，创建 WorkInProgress Fiber Tree 中的 FiberNode
	workInProgress = createWorkInProgress(root.current, {});
}

export function scheduleUpdateOnFiber(fiber: FiberNode) {
	// TODO 调度功能
	// FiberRootNode
	const root = markUpdateFromFiberToRoot(fiber);
	renderRoot(root);
}

// 更新可能发生于任意组件，向上找到 FiberRootNode
function markUpdateFromFiberToRoot(fiber: FiberNode) {
	let node = fiber;
	let parent = fiber.return;
	// 普通 FiberNode
	while (parent !== null) {
		node = parent;
		parent = node.return;
	}
	// 返回 FiberRootNode
	if (node.tag === HostRoot) {
		return node.stateNode;
	}
	return null;
}

/**
 *
 * @param root: FiberRootNode(: FiberRootNode 不是普通的 FiberNode，不能直接赋值给 workInProgress)
 */
function renderRoot(root: FiberRootNode) {
	// 初始化
	prepareFreshStack(root);

	// 开始更新阶段
	do {
		try {
			workLoop();
			break;
		} catch (e) {
			if (__DEV__) {
				console.warn('workLoop发生错误', e);
			}
			workInProgress = null;
		}
	} while (true);
}

function workLoop() {
	// 开始递阶段
	while (workInProgress !== null) {
		performUnitOfWork(workInProgress);
	}
}

function performUnitOfWork(fiber: FiberNode) {
	const next = beginWork(fiber);
	fiber.memoizedProps = fiber.pendingProps;

	// 没有子 FiberNode
	if (next === null) {
		// 开始归阶段
		completeUnitOfWork(fiber);
	} else {
		workInProgress = next;
	}
}

function completeUnitOfWork(fiber: FiberNode) {
	let node: FiberNode | null = fiber;

	do {
		completeWork(node);
		// 兄弟节点
		const sibling = node.sibling;

		if (sibling !== null) {
			workInProgress = sibling;
			return;
		}
		// 父节点
		node = node.return;
		workInProgress = node;
	} while (node !== null);
}
