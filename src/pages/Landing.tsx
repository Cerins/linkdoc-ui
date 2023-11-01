import { useDispatch, useSelector } from "react-redux";
import { IDispatch, IState } from "../store";
import { decrease, increase, increaseByMagicNumber } from "../reducers/login";

export default function Landing(){
        const login = useSelector((state: IState) => state.login);
        const dispatch = useDispatch<IDispatch>();
        return (
            <div>
                <p>Landing page content</p>
                <p>The current state val is {login.val}</p>
                <button
                    type="button"
                    onClick={
                        ()=>{
                            dispatch(increase(1));
                        }
                    }
                >
                    Increase
                </button>
                <button
                    type="button"
                    onClick={
                        ()=>{
                            dispatch(decrease(1));
                        }
                    }
                >
                    Decrease
                </button>
                <button
                    type="button"
                    onClick={
                        ()=>{
                            dispatch(increaseByMagicNumber());
                        }
                    }
                >
                    Increase by magic number
                </button>
            </div>
        );
}
