import React, { Component } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import SettingsIcon from '@material-ui/icons/Settings';
import IconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';

import * as actions from '../actions';
import requireAuth from './requireAuth';

import ResponsiveGridLayout from './ResponsiveGridLayout';
import MapWithASearchBox from './Maps/MapWithASearchBox';
import MFPPieChartPCF from './MFPPieChartPCF';
import MFPPieChartCals from './MFPPieChartCals';
import MFPCalsLine from './MFPCalsLine';

const styles = theme => ({
    card: {
        width: '300px',
        margin: '2px',
        textAlign: 'left',
        fontSize: '0px',
    },
    cardHeader: {
        color: 'white'
    },
    root: {
        flexGrow: 1,
    },
    paper: {
        textAlign: 'center',
        color: theme.palette.text.secondary,
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        overflowY: 'auto'
    },
    grid: {
        // alignItems: 'stretch'
    },
    button: {
        // margin: theme.spacing.unit,
    },
    deleteContainer: {

    }
})

class MembersArea extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dashboardReady: false,
            containerHovered: -1
        };

        this.props.getUserDetails(() => {
            localStorage.setItem('dashboard-layout', this.props.layout)
            this.setState({
                containers: [
                    {
                        data:
                            <div>
                                Welcome {this.props.username} to your new fitness dashboard!
                            </div>,
                        key: 'welcomeMessage',
                        minWidth: 2,
                        minHeight: 2
                    },
                ]
            }, () => {
                const newContainers = this.state.containers;
                this.props.getMFP(() => {
                    this.props.mfp.mfpData.reverse();
                    newContainers.push(
                        {
                            data:
                                <div style={{ display: "flex", flexWrap: "wrap" }}>
                                    {this.props.mfp.mfpData.map((day, index) => (
                                        <div key={day.date} style={{ border: "2px black solid", padding: "5px", margin: "5px", flexGrow: 1 }}>
                                            <MFPCalsLine
                                                date={index === 0 ? "Today" : new Date(day.date).toDateString()}
                                                actual={day.totals.calories}
                                                goal={day.goals.calories} />
                                        </div>)
                                    )}
                                </div>
                            ,
                            key: "mfpcals",
                            minWidth: 2,
                            minHeight: 10
                        })
                        newContainers.push(
                            {
                                data:
                                    <div style={{ display: "flex", flexWrap: "wrap", height: "calc(100% - 10px)", alignItems: "center", justifyContent: "center" }}>
                                        <CircularProgress />
                                    </div>
                                ,
                                key: "loading",
                                minWidth: 2,
                                minHeight: 4
                            })
                    let goals = 0;
                    let totals = 0;
                    for (let i = 0; i < this.props.mfp.mfpData.length; i += 1) {
                        goals += this.props.mfp.mfpData[i].goals.calories;
                        totals += this.props.mfp.mfpData[i].totals.calories;
                    }
                    newContainers.push(
                        {
                            data:
                                <div style={{ height: "100%" }}>
                                    <MFPPieChartCals actual={totals} goal={goals} remaining={goals - totals} />
                                </div>
                            ,
                            key: "mfpcals-chart",
                            minWidth: 4,
                            minHeight: 10
                        })
                    this.setState({
                        containers: newContainers,
                        dashboardReady: true
                    });
                })
            })
        });
    }

    componentDidMount() {
        window.addEventListener('beforeunload', this.saveDetails());
    }

    componentWillUnmount() {
        window.removeEventListener('beforeunload', this.saveDetails());
    }

    saveDetails = () => {
        this.props.saveDetails(() => {
            console.log('details saved!')
        })
    }

    handleAddNewContainer = () => {
        const { containers } = this.state;
        containers.push({
            data:
                <div />,
            key: `container-${containers.length}-${Math.random() * 100}`,
            minWidth: 4,
            minHeight: 4
        })
        this.setState({ containers })
    }

    handleDeleteContainer = (key) => {
        const { containers } = this.state;
        const newContainers = containers.filter(item => item.key !== key);
        this.setState({ containers: newContainers })
    }

    hoverButton = (index) => {
        this.setState({ containerHovered: index === false ? -1 : index });
    }

    render() {
        const { classes } = this.props;
        const { containers, containerHovered } = this.state;
        return (
            <div className={classes.root}>
                {this.state.dashboardReady ? (
                    <span>
                        <IconButton onClick={this.handleAddNewContainer} color="primary" aria-label="add" className={classes.button}>
                            <AddIcon />
                        </IconButton>
                        <ResponsiveGridLayout>
                            {containers.map((item, index) => (
                                <div key={item.key} data-grid={{ w: item.minWidth || 2, h: item.minHeight || 2, x: 0, y: 50, minW: item.minWidth || 2, minH: item.minHeight || 2 }}>
                                    <Paper square className={classes.paper}>
                                        <div style={{ height: "20px", width: "100%", display: "table" }} onMouseEnter={() => this.hoverButton(index)} onMouseLeave={() => this.hoverButton(false)}>
                                            {containerHovered === index ? (<span><IconButton onClick={() => this.handleDeleteContainer(item.key)} color="primary" aria-label="delete" className={classes.deleteContainer} disableRipple style={{ height: "auto" }}>
                                                <DeleteIcon style={{ fontSize: 20 }} />
                                            </IconButton>
                                            <IconButton color="primary" aria-label="settings" className={classes.deleteContainer} disableRipple style={{ height: "auto" }}>
                                                <SettingsIcon style={{ fontSize: 20 }} />
                                            </IconButton></span>) : (<div />)}

                                        </div>
                                        <div style={{ height: "100%", width: '100%' }}>
                                            {item.data}
                                        </div>
                                    </Paper>
                                </div>
                            ))}
                            {/* <div key="2" data-grid={{ w: 4, h: 12, x: 2, y: 0, minW: 2, minH: 3 }}>
                                <Paper square className={classes.paper}>
                                    <MapWithASearchBox />
                                </Paper>
                            </div>
                            <div key="3" data-grid={{ w: 4, h: 12, x: 2, y: 0, minW: 2, minH: 3 }}>
                                <Paper square className={classes.paper}>
                                    <MFPPieChartPCF />
                                </Paper>
                            </div>
                            <div key="4" data-grid={{ w: 4, h: 12, x: 2, y: 0, minW: 2, minH: 3 }}>
                                <Paper square className={classes.paper}>
                                    <MFPPieChartCals />
                                </Paper>
                            </div>
                            <div key="5" data-grid={{ w: 4, h: 12, x: 2, y: 0, minW: 2, minH: 3 }}>
                                <Paper square className={classes.paper}>
                                    <MFPCalsLine />
                                </Paper>
                            </div> */}
                        </ResponsiveGridLayout>
                    </span>
                ) : (<div />)}
            </div >
        )
    }
}

function mapStateToProps(state) {
    return {
        username: state.auth.username,
        mfp: state.auth.mfp,
        layout: state.auth.layout
    }
}

export default compose(
    requireAuth,
    connect(mapStateToProps, actions),
    // WidthProvider(Responsive),
    withStyles(styles)
)(MembersArea);