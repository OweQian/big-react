import type { Action } from 'shared/ReactTypes';

export interface Update<State> {
	action: Action<State>;
}

// 初始化 update 实例
export const createUpdate = <State>(action: Action<State>): Update<State> => {
	return {
		action
	};
};

export interface UpdateQueue<State> {
	shared: {
		pending: Update<State> | null;
	};
}

// 初始化 updateQueue
export const createUpdateQueue = <State>() => {
	return {
		shared: {
			pending: null
		}
	} as UpdateQueue<State>;
};

// 向 updateQueue 中增加 update 实例
export const enqueueUpdate = <State>(
	updateQueue: UpdateQueue<State>,
	update: Update<State>
) => {
	updateQueue.shared.pending = update;
};

/***
 * updateQueue 消费 update 实例
 * @param baseState 初始状态
 * @param pendingUpdate 要消费的 update 实例
 * @return 新状态对象
 */
export const processUpdateQueue = <State>(
	baseState: State,
	pendingUpdate: Update<State> | null
): { memoizedState: State } => {
	const result: ReturnType<typeof processUpdateQueue<State>> = {
		memoizedState: baseState
	};

	if (pendingUpdate !== null) {
		const action = pendingUpdate.action;
		if (action instanceof Function) {
			// baseState 1 update (x) => 4x => memoizedState 4
			result.memoizedState = action(baseState);
		} else {
			// baseState 1 update 2 => memoizedState 2
			result.memoizedState = action;
		}
	}
	return result;
};
