import { random, shuffle } from 'lodash';
import { DOMAttributes, useReducer, useRef, useState } from 'react';
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
      };

type State = {
    numbers: [number, number];
    maximum: number;
    result: number;
    errors: number;
    run: boolean;
    end: boolean;
};

const initial: State = {
    numbers: [1, 1],
    maximum: 5,
    result: -1,
    errors: 0,
    run: false,
    end: false,
};

const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case 'NEXT': {
            console.log(state);
            if (state.end) {
                return state;
            }
            return {
                ...state,
                numbers: shuffle([random(2, state.maximum), random(1, 9)]) as [
                    number,
                    number,
                ],
                result: state.result + 1,
                run: true,
            };
        }
        case 'RESET': {
            return initial;
        }
        case 'END': {
            return { ...state, end: true };
        }
        case 'ERROR': {
            return { ...state, errors: state.errors + 1 };
        }
        default: {
            return state;
        }
    }
};

export const Multiply = () => {
    const [{ numbers, maximum, result, run, end, errors }, dispatch] =
        useReducer(reducer, initial);

    const [minutes, setMinutes] = useState(2);
    const inp = useRef<HTMLInputElement>(null);

    const onEnd = () => dispatch({ type: 'END' });
    const onReset = () => dispatch({ type: 'RESET' });
    const onError = () => dispatch({ type: 'ERROR' });
    const onNext = () => dispatch({ type: 'NEXT' });

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
            {!run && (
                <>
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
                </>
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
