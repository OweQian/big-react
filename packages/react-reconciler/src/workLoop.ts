import { beginWork } from './beginWork';
import { completeWork } from './completeWork';
import { FiberNode, FiberRootNode, createWorkInProgress } from './fiber';
import { HostRoot } from './workTags';

// 全局变量 workInProgress
let workInProgress: FiberNode | null = null;

// 挂载：FiberRootNode
function prepareFreshStack(root: FiberRootNode) {
	// 创建 WorkInProgress Tree 中的 HostRootFiber
	workInProgress = createWorkInProgress(root.current, {});
}

export function scheduleUpdateOnFiber(fiber: FiberNode) {
	// TODO 调度功能
	// FiberRootNode
	const root = markUpdateFromFiberToRoot(fiber);
	renderRoot(root);
}

// 更新可能发生于任意组件，而更新流程是从根节点，即 HostRootFiber 递归的
function markUpdateFromFiberToRoot(fiber: FiberNode) {
	let node = fiber;
	let parent = fiber.return;
	// 普通 FiberNode
	while (parent !== null) {
		node = parent;
		parent = node.return;
	}
	// 找到 FiberRootNode
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
			console.warn('workLoop发生错误', e);
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
