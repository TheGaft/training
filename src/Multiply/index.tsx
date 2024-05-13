import { flatMap, flatten, isEmpty, range, shuffle } from 'lodash';
import { DOMAttributes, useEffect, useReducer, useRef, useState } from 'react';
import { Timer } from '../components/Timer';
import { flushSync } from 'react-dom';
import styles from './index.module.scss';
import classNames from 'classnames';

type Action =
    | {
          type: 'RESET';
      }
    | {
          type: 'END';
      }
    | {
          type: 'ERROR';
      }
    | {
          type: 'NEXT';
      }
    | {
          type: 'SET_MAX';
          payload: number;
      }
    | {
          type: 'SET_STACK';
          payload: (readonly [number, number])[];
      };

type State = {
    numbers: readonly [number, number];
    maximum: number;
    result: number;
    errors: number;
    run: boolean;
    end: boolean;
    stack?: (readonly [number, number])[];
    message?: string;
};

const initial: State = {
    numbers: [1, 1] as const,
    maximum: 5,
    result: -1,
    errors: 0,
    run: false,
    end: false,
};

const getStack = (minimum: number, maximum: number) => {
    const newStack = flatMap(range(minimum, maximum + 1), (n1) =>
        range(2, 10).map((n2) => [n1, n2] as const),
    );

    return flatten([shuffle(newStack), shuffle(newStack)]);
};

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'NEXT': {
            if (state.end) {
                return state;
            }
            const [numbers, ...stack] = state.stack ?? [];
            if (isEmpty(state.stack)) {
                return {
                    ...state,
                    numbers: [1, 1],
                    end: true,
                    result: state.result + 1,
                    message: 'Все примеры решены',
                };
            }
            return {
                ...state,
                numbers: shuffle(numbers) as [number, number],
                stack,
                result: state.result + 1,
                run: true,
            };
        }
        case 'SET_STACK': {
            return {
                ...state,
                stack: action.payload,
            };
        }
        case 'SET_MAX': {
            return {
                ...state,
                maximum: action.payload,
            };
        }
        case 'RESET': {
            return initial;
        }
        case 'END': {
            return {
                ...state,
                end: true,
                message: 'Время истекло',
            };
        }
        case 'ERROR': {
            return {
                ...state,
                errors: state.errors + 1,
            };
        }
        default: {
            return state;
        }
    }
};

export const Multiply = () => {
    const [{ numbers, maximum, result, run, end, errors, message }, dispatch] =
        useReducer(reducer, initial);

    const [minutes, setMinutes] = useState(2);
    const inp = useRef<HTMLInputElement>(null);

    const onEnd = () => dispatch({ type: 'END' });
    const onReset = () => dispatch({ type: 'RESET' });
    const onError = () => dispatch({ type: 'ERROR' });
    const onNext = () => dispatch({ type: 'NEXT' });
    const onSetStack = (payload: (readonly [number, number])[]) =>
        dispatch({ type: 'SET_STACK', payload });
    const onSetMax = (payload: number) =>
        dispatch({ type: 'SET_MAX', payload });

    useEffect(() => {
        if (!run) {
            onSetStack(getStack(2, maximum));
        }
    }, [run, maximum]);

    const testAnswer: DOMAttributes<HTMLFormElement>['onSubmit'] = (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        if (fd.get('answer') === `${numbers[0] * numbers[1]}`) {
            flushSync(onNext);
            inp.current?.focus();
        } else {
            onError();
        }
    };

    return (
        <form onSubmit={testAnswer}>
            {message && <h2>{message}</h2>}
            {!run && (
                <div>
                    <div>Выбрать время:</div>
                    {Array.from({ length: 10 }).map((_, i) => (
                        <button
                            type="button"
                            key={i}
                            onClick={() => setMinutes(i + 1)}
                            className={classNames(styles.btn, {
                                [styles.activeBtn]: minutes === i + 1,
                            })}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
            {!run && (
                <div>
                    <div>Выбрать максимальный множитель:</div>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <button
                            type="button"
                            key={i}
                            onClick={() => onSetMax(i + 2)}
                            className={classNames(styles.btn, {
                                [styles.activeBtn]: maximum === i + 2,
                            })}
                        >
                            {i + 2}
                        </button>
                    ))}
                </div>
            )}

            {run && !end && <Timer minutes={minutes} options={{ onEnd }} />}

            <br />
            <br />
            <div>Умножение до {maximum}</div>
            <div className={styles.text}>
                <span>{numbers[0]}</span> * <span>{numbers[1]}</span> ={' '}
                <input
                    key={numbers.join('_')}
                    name="answer"
                    type="text"
                    maxLength={2}
                    style={{ width: '10ch' }}
                    ref={inp}
                    disabled={end}
                />
                <button type="reset">X</button>
            </div>
            {!!(result >= 0) && (
                <div>
                    Решено: {result}
                    <br />
                    Ошибок: {errors}
                </div>
            )}
            <div>
                <button type="button" onClick={onReset}>
                    Начать сначала
                </button>
            </div>
            <button type="submit" hidden>
                Проверить
            </button>
        </form>
    );
};
