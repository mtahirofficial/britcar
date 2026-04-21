import axios from 'axios';
import React from 'react'
import { connect } from 'react-redux';
import actionTypes from '../../store/actionTypes';

class CountDownTimerC extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            time: {},
            seconds: 0,
            changeSeconds: '-',
            cutoffPassed: false,
            peekMinute: 'Last Minute...'
        };
        this.timer = 0;
        this.startTimer = this.startTimer.bind(this);
        this.countDown = this.countDown.bind(this);
    }
    calculateCutOff = async cutoffTime => {
        let diff;
        const time = new Date()
        const now = time.getTime()
        const cutoff = cutoffTime ? new Date(cutoffTime).getTime() : null
        if (cutoff && cutoff > now) {
            diff = cutoff - now
            this.setState({
                changeSeconds: "-",
                cutoffPassed: false,
            });
        } else if (cutoff && cutoff < now) {
            diff = now - cutoff
            this.setState({
                changeSeconds: "+",
                cutoffPassed: true,
            });
        }

        if (diff) {
            let diffInSec = parseInt(diff / 1000)
            this.setState({ seconds: diffInSec })
        }
    }

    secondsToTime(secs) {
        let days = Math.floor(secs / (60 * 60 * 24));

        let divisor_for_hours = secs % (60 * 60 * 24);
        let hours = Math.floor(divisor_for_hours / (60 * 60));

        let divisor_for_minutes = secs % (60 * 60);
        let minutes = Math.floor(divisor_for_minutes / 60);

        let divisor_for_seconds = divisor_for_minutes % 60;
        let seconds = Math.ceil(divisor_for_seconds);

        let obj = {
            "d": days,
            "h": hours,
            "m": minutes,
            "s": seconds
        };
        return obj;
    }

    async componentDidMount() {
        await this.calculateCutOff(this.props.cutoff)
        this.startTimer()
        let timeLeftVar = this.secondsToTime(this.state.seconds);
        this.setState({ time: timeLeftVar });
    }

    startTimer() {
        if (this.timer === 0 && this.state.seconds > 0) {
            this.timer = setInterval(this.countDown, 1000);
        }
    }

    submitOrder = orderId => {
        const options = {
            method: 'GET',
            url: `/order/auto-submit/${orderId}/${this.props.shopId}`,
        }
        console.log('options', options);
        axios(options)
            .then(({ data }) => {
                console.log(data);
                if (data.submittedAt) {
                    console.log(data.submittedAt);
                    const orders = this.props.purchaseOrders
                    for (const i in orders) {
                        if (orders[i].id === orderId) {
                            orders[i].status = 'sub'
                            orders[i].submittedAt = data.submittedAt
                        }
                    }
                    this.props.savePurchaseOrders(orders)
                }
            })
            .catch(error => {
                console.log(error);
            })
    }

    countDown() {
        let seconds
        if (this.state.changeSeconds === '-') {
            seconds = this.state.seconds - 1;
        } else if (this.state.changeSeconds === '+') {
            seconds = this.state.seconds + 1;
        }

        this.setState({
            time: this.secondsToTime(seconds),
            seconds: seconds,
        });

        if (seconds === 60 && this.state.changeSeconds === '-') {
            this.submitOrder(this.props.orderId)
        }

        if (seconds === 0) {
            this.setState({
                changeSeconds: "+",
                cutoffPassed: true,
                peekMinute: "Time Passed..."
            });
        }
    }

    render() {
        const overTimeStyle = {
            color: this.state.cutoffPassed ? '#CA3142' : '#000'
        }
        const isPassed = this.state.cutoffPassed ? 'ago' : null
        if (this.state.time.d && this.state.time.h && this.state.time.m) {
            return <span style={overTimeStyle}>{this.state.time.d} day(s) {this.state.time.h} hour(s) {this.state.time.m} minute(s) {isPassed}</span>
        } else if (!this.state.time.d && this.state.time.h && this.state.time.m) {
            return <span style={overTimeStyle}>{this.state.time.h} hour(s) {this.state.time.m} minute(s) {isPassed}</span>
        } else if (!this.state.time.d && !this.state.time.h && this.state.time.m) {
            return <span style={overTimeStyle}>{this.state.time.m} minute(s) {isPassed}</span>
        } else if (!this.state.time.d && !this.state.time.h && !this.state.time.m && this.state.time.s) {
            return <span style={overTimeStyle}>{this.state.peekMinute}</span>
        } else {
            return '-'
        }
    }
}

const mapDispatchToProps = dispatch => {
    const dispatchFunc = type => { return data => dispatch({ type, payload: data }) }
    const { savePurchaseOrders } = actionTypes
    return {
        savePurchaseOrders: dispatchFunc(savePurchaseOrders),
    }
}

const mapStateToProps = state => {
    const { serverLink, shopId } = state.ConfigReducer
    const { purchaseOrders } = state.POReducer
    return { serverLink, shopId, purchaseOrders }
}
export default connect(mapStateToProps, mapDispatchToProps)(CountDownTimerC)