import {
  Reducer,
  AnyAction,
  Middleware,
  Store,
  createStore,
  applyMiddleware,
  PreloadedState,
} from 'redux';
import createSagaMiddleware, { SagaMiddlewareOptions, SagaMiddleware } from 'redux-saga';

export interface SagaSimOptions<RootState> {
  initialState?: PreloadedState<RootState>;
  rootReducer: Reducer<RootState>;
  sagaMiddlewareOptions?: SagaMiddlewareOptions;
  otherMiddleware?: Middleware[];
}

interface PendingAction {
  reject: (reason?: any) => void;
  resolve: (action: AnyAction) => void;
  promise: Promise<AnyAction>;
}

interface PendingActionMap {
  [key: string]: PendingAction | undefined;
}

export class SagaSim<RootState> {
  private sagaMiddleware: SagaMiddleware;
  private store: Store<RootState>;
  private pendingActions: PendingActionMap = {};
  private dispatchedActions: AnyAction[] = [];

  constructor({
    initialState = {} as PreloadedState<RootState>,
    rootReducer,
    otherMiddleware = [],
    sagaMiddlewareOptions,
  }: SagaSimOptions<RootState>) {
    this.sagaMiddleware = createSagaMiddleware(sagaMiddlewareOptions);
    this.store = createStore(
      rootReducer,
      initialState,
      applyMiddleware(...otherMiddleware, this.middleware, this.sagaMiddleware),
    );
  }

  run<S extends (...args: any[]) => any>(saga: S, ...args: Parameters<S>) {
    const task = this.sagaMiddleware.run(saga, ...args);
    const promise = task.toPromise();

    promise
      .then(() => {
        Object.keys(this.pendingActions).forEach(actionType => {
          throw Error(`${actionType} was waited for, but never called.`);
        });
      })
      .catch(error => {
        Object.values(this.pendingActions).forEach(pendingAction => pendingAction?.reject(error));
      });

    return promise;
  }

  getDispatchedActions() {
    return [...this.dispatchedActions];
  }

  getState() {
    return this.store.getState();
  }

  dispatch(action: AnyAction) {
    return this.store.dispatch(action);
  }

  waitFor(actionType: string) {
    const pendingAction = this.pendingActions[actionType];
    if (pendingAction) {
      return pendingAction.promise;
    }

    return this.waitForNext(actionType);
  }

  waitForNext(actionType: string) {
    return this.addActionToPending(actionType).promise;
  }

  private addActionToPending(type: string) {
    const partial: Partial<PendingAction> = {};
    partial.promise = new Promise<AnyAction>((resolve, reject) => {
      partial.reject = reject;
      partial.resolve = resolve;
    });

    const pendingAction = partial as PendingAction;
    this.pendingActions[type] = pendingAction;
    return pendingAction;
  }

  private middleware: Middleware = () => next => action => {
    this.dispatchedActions.push(action);

    if (this.pendingActions[action.type]) {
      this.pendingActions[action.type]?.resolve(action);
    } else {
      this.addActionToPending(action.type).resolve(action);
    }

    return next(action);
  };
}
