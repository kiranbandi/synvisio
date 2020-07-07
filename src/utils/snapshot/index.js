import uniqid from 'uniqid';
import { isEqual } from 'lodash';
import ParseSVG from '../ParseSVG';
import svgSaver from '../saveSVGasPNG';

var snapshot = {};
var datastore = {};
var currentData = {};
var onRecall = null;
var snapshotTimer = false;
var isTimerON = false;
var triggeredData = {};
var isAutoModeON = false;

var isIntialized = false;

var stackedSnapshot = {};

snapshot.initializeSnapshot = function(isAuto = false, timerDur = 5000, onRecallCallback = () => {}) {


    isAutoModeON = isAuto;

    if (!isIntialized) {
        // create a snapshot panel container 
        let snapshotContainer = $("<div>", {
                'class': 'snapshot-custom-wrapper',
                'html': '<h5 style="font-size: 15px;text-transform: uppercase;margin: 5px 0px 0px 0px;font-weight: bold;color: #424857;">snapshot panel</h5>',
                css: {
                    'background': 'rgba(255, 255, 255, 0.90)',
                    'width': '275px',
                    'position': 'fixed',
                    'top': '100px',
                    'left': '15px',
                    'border': '2px solid #2f2f2f',
                    'border-radius': '5px',
                    'z-index': '5000',
                    'padding': '5px',
                    'cursor': 'move',
                    'max-height': '395px',
                    'text-align': 'center'
                }
            })
            .appendTo('body');

        let modeSwitchCheckbox = $('<input />', {
                type: 'checkbox',
                id: 'snapshot-mode-checkbox',
                'checked': isAuto
            })
            .appendTo(snapshotContainer)
            .change((event) => {
                if (event.currentTarget.checked) {
                    isAutoModeON = true;
                    // If a timer has not been created
                    // create it
                    snapshotTimer = snapshotTimer ? snapshotTimer :
                        new Timer(() => {
                            snapshot.storeSnapshot();
                            // stop the timer after its complete
                            if (snapshotTimer)
                                snapshotTimer.stop();
                        }, timerDur);

                    // turn timer off and stop it
                    //  then prime it to be triggered 
                    isTimerON = false;
                    snapshotTimer.stop();
                    $('.snapshot-trigger').text('start');

                } else {
                    // turn timer off and stop it
                    //  then prime it to be triggered 
                    isTimerON = false;
                    snapshotTimer.stop();
                    snapshotTimer = false;
                    isAutoModeON = false;
                    $('.snapshot-trigger').text('snapshot');
                }
            });

        $("<label>", {
                'for': 'snapshot-mode-checkbox',
                'text': 'AUTO',
                css: {
                    'margin-right': '10px',
                    'margin-left': '5px',
                    'cursor': 'pointer',
                    'color': 'black'
                }
            })
            .appendTo(snapshotContainer);

        snapshotTimer = isAuto ? new Timer(() => {
            snapshot.storeSnapshot();
            // stop the timer after its complete
            if (snapshotTimer)
                snapshotTimer.stop();
        }, timerDur) : false;

        let snapshotButton = $("<button>", {
                'class': 'snapshot-trigger',
                'html': isAuto ? 'start' : 'snapshot',
                css: {
                    'margin-bottom': ' 0',
                    'font-weight': ' normal',
                    'text-align': ' center',
                    'vertical-align': ' middle',
                    '-ms-touch-action': ' manipulation',
                    'touch-action': ' manipulation',
                    'cursor': ' pointer',
                    'background-image': ' none',
                    'border': ' 1px solid transparent',
                    'white-space': ' nowrap',
                    'padding': ' 6px 12px',
                    'font-size': ' 14px',
                    'line-height': ' 1.5',
                    'border-radius': ' 4px',
                    '-webkit-user-select': ' none',
                    '-moz-user-select': ' none',
                    '-ms-user-select': ' none',
                    'user-select': ' none',
                    'color': ' #1997c6',
                    'background-color': ' transparent',
                    'border-color': ' #1997c6',
                    'margin': ' 10px auto',
                    'display': 'inline-block',
                    'text-transform': ' uppercase'
                }
            })
            .appendTo('.snapshot-custom-wrapper')
            .click(() => {
                if (isAutoModeON) {
                    // timer is off at the moment so trigger it ON
                    if (!isTimerON) {
                        isTimerON = true;
                        snapshotTimer.reset();
                        $('.snapshot-trigger').text('stop');
                    } else {
                        isTimerON = false;
                        snapshotTimer.stop();
                        $('.snapshot-trigger').text('start');
                    }

                }
                snapshot.storeSnapshot();
            });

        let snapshotImageWrapper = $("<div>", {
                'class': 'snapshot-image-wrapper',
                css: {
                    'max-height': '300px',
                    'overflow-y': 'scroll',
                    'text-align': 'center'
                }
            })
            .appendTo('.snapshot-custom-wrapper');
        $('.snapshot-custom-wrapper').mousedown(handle_mousedown);
    }

    onRecall = onRecallCallback;
    isIntialized = true;
}

snapshot.updateSnapshot = function(data) {
    // store a cloned copy of the data
    currentData = _.cloneDeep(data);
    // if timer is ON reset it to be triggered with the new data
    if (isTimerON)
        snapshotTimer.reset();
}

snapshot.storeSnapshot = function() {

    let isNewSnapshotAvailable = !!currentData && !isEqual(stackedSnapshot, currentData) && !isEqual(triggeredData, currentData);

    // store current data in snapshot
    let snapshotData = currentData;
    // clear currentData
    currentData = false;
    // clear trigger 
    triggeredData = false;

    // Get the SVG element
    let svgElements = $('.exportable-svg');
    // check if there is a visual snapshot is available to be stored
    if (isNewSnapshotAvailable && svgElements.length > 0) {

        ParseSVG(svgElements[0]).then((svgEl) => {
            svgSaver.svgAsPngUri(svgEl, { 'scale': '0.5' })
                .then(uri => {
                    const snapshotID = uniqid();
                    // store snapshotData
                    datastore[snapshotID] = snapshotData;
                    let imageButton = $("<div>", {
                            'class': 'snapshot-entry',
                            'id': snapshotID,
                            css: {
                                'border': ' 1px solid transparent',
                                'border-radius': ' 4px',
                                'border-color': ' #1997c6',
                                'display': 'inline-block',
                                'position': 'relative',
                                'overflow': 'hidden',
                                'margin': '5px auto',
                                'cursor': 'pointer'
                            }
                        })
                        .appendTo('.snapshot-image-wrapper')
                        .click((event) => {
                            const targetName = event.target.className,
                                uniqueCode = event.currentTarget.id;
                            if (targetName.indexOf('snapshot-recall') > -1) {
                                const data = datastore[uniqueCode];
                                // store seperately so self triggerring doesnt occur
                                triggeredData = _.cloneDeep(data);
                                if (data) { onRecall(data) }
                            } else {
                                delete datastore[uniqueCode];
                                $('#' + uniqueCode).remove();
                            }

                        })

                    let snapshotDelete = $("<div>", {
                            'class': 'snapshot-delete',
                            'html': '<span >×</span>',
                            css: {
                                'background': ' white',
                                'border-radius': ' 10px',
                                'width': ' 20px',
                                'position': ' absolute',
                                'right': ' 2px',
                                'top': ' 2px',
                                'color': ' black',
                                'opacity': ' 1',
                                'float': ' right',
                                'font-size': ' 21px',
                                'font-weight': ' bold',
                                'line-height': ' 1'
                            }
                        })
                        .appendTo(imageButton);

                    imageButton.prepend('<img class="snapshot-recall" height="100" width="235" id=' + snapshotID + ' src=' + uri + ' />')
                });
        });
    }
}

// blurb to make element draggable
// https://stackoverflow.com/questions/2424191
function handle_mousedown(e) {
    window.my_dragging = {};
    my_dragging.pageX0 = e.pageX;
    my_dragging.pageY0 = e.pageY;
    my_dragging.elem = this;
    my_dragging.offset0 = $(this).offset();

    function handle_dragging(e) {
        var left = my_dragging.offset0.left + (e.pageX - my_dragging.pageX0);
        var top = my_dragging.offset0.top + (e.pageY - my_dragging.pageY0);
        $(my_dragging.elem)
            .offset({ top: top, left: left });
    }

    function handle_mouseup(e) {
        $('body')
            .off('mousemove', handle_dragging)
            .off('mouseup', handle_mouseup);
    }
    $('body')
        .on('mouseup', handle_mouseup)
        .on('mousemove', handle_dragging);
}

//  code sourced from stackoverflow - https://stackoverflow.com/questions/8126466/how-do-i-reset-the-setinterval-timer
function Timer(fn, t) {
    var timerObj = setInterval(fn, t);

    this.stop = function() {
        if (timerObj) {
            clearInterval(timerObj);
            timerObj = null;
        }
        return this;
    }

    // start timer using current settings (if it's not already running)
    this.start = function() {
        if (!timerObj) {
            this.stop();
            timerObj = setInterval(fn, t);
        }
        return this;
    }

    // start with new interval, stop current interval
    this.reset = function() { return this.stop().start() };
}

module.exports = snapshot;