/*
    File: jsonForms.js
    Description: Contains all of the json type objects which will be converted into html.
                 they are templates aka "Forms."
*/
var colors = function() { //depricated use $p('color');
    return {
        blue: $p('blue'),
        darkBlue: $p('darkBlue'),
        purple: $p('purple'),
        gray: $p('gray'),
    };
};

var confirmDel = function (indx) {
    $.colorbox({html: '<div id="cbConfirm"></div>', width: '500px', height: '140px'});
    appendHTML(forms['confirmPopUp']({
        text: '<h3> Are you sure you wish to delete this entire schedule? </h3>',
        func: function () {
            cmd.del(indx);
            //$.colorbox.close(); 
        },
    }), '#cbConfirm');
};

var confirmTimeDel = function(indx) {
    $.colorbox({html: '<div id="cbConfirm"></div>', width: '500px', height: '120px'});
    appendHTML(forms['confirmPopUp']({
        text: '<h3> Are you sure you wish to delete this Schedule Time? </h3>',
        func: function() {
            var data = dataObjs.evntTimes.EventScheduleItems[indx].indxScheduleDateID;
            var data2 = dataObjs.evntTimes.EventScheduleItems[indx].indxOrganizationEventID;
            $project.remove('scheduleItem')('Data='+data+'&Data2='+data2).done(function(dta) {
                cmd.events.checkStatus(0, true).done(function() {
                    
                    //$v('display-tblInfo').clear();
                    $project.draw('scheduleItems')($v().events()[parseInt(dataObjs.slctdObj.substring(3, dataObjs.slctdObj.length))].indxScheduleID);
                    $.colorbox.close();
                });
                
            });
        }
    }), '#cbConfirm');

};

var dpToggle = 1;

var previousTxt;
//this function is for the schedule time textboxes.
function tgglTxtBx(id, dbVal, defVal, updateEnabled) {
    var object = function (val, color) { //getter setter awesomeness!!!
        if(undefined !== val) {
            if(undefined !== color) {
                $('#'+id).css({
                    'color': color,
                });
            }
            $('#'+id)[0].value = val;
        } else {
            return { //if both parameters were undefined, returns this object.
                color: cmd.rgbToHex($('#'+id)[0].style['color']).toUpperCase(), 
                value: $('#'+id)[0].value,
            };
        }
    };

    var focus = function() {
        dataObjs.slctdDiv = id;
        if(object().color == $p('purple')) { //if this entry has been edited, by user or by function.
            previousTxt = object().value;
            //object('');
        } else {
            object('', $p('purple'));
        }
        //$('#'+id).select(); //so that the text (time) is hilighted.
    };

    var blur = function() {
        if(object().color == $p('purple')) { //purple if the entry was edited!
            if(undefined !== dbVal && '' !== dbVal && null !== dbVal) {
                if(object().value === '') {
                    object(undefined !== previousTxt ? previousTxt : dbVal);
                }
            } else {
                if(previousTxt !== defVal && undefined !== previousTxt) {
                    if(object().value === '') {
                        object(previousTxt, $p('purple'));
                    }
                } else {
                    if(object().value === '') {
                        object(defVal, $p('gray'));
                    }
                }
            }
        }
        if(updateEnabled) {
            if(previousTxt != object().value && dbVal != object().value) {
                if('' !== previousTxt && '' !== object().value && object().value != previousTxt && object().value != defVal) { //if it's been edited and does not match the db.
                    object(object().value, $p('red'));
                }
            } 
        }
        previousTxt = undefined;
    };
    var hasfocus = false;
    $('#'+id).focus(function() {
        focus();
        //hasfocus = true;
        //$('#'+id).select();
    }).blur(function() {
        blur();
        hasfocus = false;
    }).click(function() {
        if(!hasfocus) {
            $('#'+id).select();
            hasfocus = false;
        }
        hasfocus = true;
    });
}

function toggleTxtBx(id, txt) {
    if( $('#'+id)[0].value == txt ) {
        //$('#'+id)[0].value = '';
        $('#'+id).css({
            'color': $p('purple'),
        });
    } else {
        if( $('#'+id)[0].value === '' ) {
            $('#'+id)[0].value = txt;
            $('#'+id).css({
                'color': $p('gray'),
            });
        }
    }
}

var forms = {
    createEventMinimal: function() { //converted to jsonHTML v0.8-beta standard.
        return $jConstruct('div', {
            id: 'createForm',
            text: '<h3>Setup New Schedule</h3>',
        }).css({
            'font-family': 'sans-serif',
            'text-align': 'center',
        }).addChild(function() {
            return $jConstruct('textbox', {
                id: 'scheduleTitle',
                text: 'Schedule Title',
            }).css({
                'color': $p('purple'),
            }).addFunction(function() {
                tgglTxtBx('scheduleTitle', 'Schedule Title');
            });
        }).addChild(function() {
            return $jConstruct('textbox', {
                id: 'scheduleDescription',
                text: 'Schedule Description',
            }).css({
                'color': $p('purple'),
            }).addFunction(function() {
                tgglTxtBx('scheduleDescription', 'Schedule Description');
            });
        }).addChild(function() {
            return $jConstruct('div', {
                id: 'mkSchedDtPkr',
            }).css({
                'border': '1px solid '+$p('gray'),
                'display': 'inline-block',
            }).addFunction(function() {
                $('#mkSchedDtPkr').datepicker();
            }).addChild(function() {
                return $jConstruct('div', {
                    id: 'date',
                }).css({
                    'margin-right': '5px',
                });
            });
        }).addChild(function() {
            return $jConstruct('div', {
                id: 'buttonContainer',
            }).css({
                'width': '50%',
                'float': 'right',
            }).addChild(function() {
                return $jConstruct('button', {
                    id: 'formSubmit',
                    text: 'submit',
                }).event('click', function() {
                    var obj = dataObjs.evntSchdl;
                    var t = cmd.time;

                    function addDays(date, days) {
                        var result = new Date(date);
                        result.setDate(date.getDate() + days);
                        return result;
                    }

                    obj.dtDateAdded = t.today().toISOString();
                    
                    obj.strScheduleTitle = $('#scheduleTitle')[0].value;
                    obj.strScheduleDescription = $('#scheduleDescription')[0].value;
                    obj.dtScheduleDate = $('#mkSchedDtPkr').datepicker('getDate').toISOString();
                    obj.dtOnLineFilledStartDate = cmd.time.removeISOTimeZone(t.today()).toISOString(); //12:00AM
                    obj.dtOnLineFilledEndDate = cmd.time.removeISOTimeZone(addDays(t.midnightPm($('#mkSchedDtPkr').datepicker('getDate')), 1)).toISOString(); //11:55PM
                    obj.indxOrganizationEventID = id.event;
                    obj.indxPhotographerID = id.photographer;
                    console.log('sending JSON:', obj); //this is the json which is being sent to the server.
                    var url = 'https://www.mypicday.com/Handlers/ScheduleCreateData.aspx?Data='+JSON.stringify(obj);
                    $sql(url).get(function(data){
                        var parsed = JSON.parse(data);
                        console.log('data returned:', parsed);
                        var len;
                        
                        if(undefined !== dataObjs.srvdTbls.EventSchedules) {
                            dataObjs.srvdTbls.EventSchedules[dataObjs.srvdTbls.EventSchedules.length] = parsed;
                            $v('display-tbls').clear();
                        } else {
                            dataObjs.srvdTbls.EventSchedules = [];
                            dataObjs.srvdTbls.EventSchedules[0] = parsed;
                        }
                        cmd.events.drawJSON(dataObjs.srvdTbls);
                        $.colorbox.close();
                    });
                });
            }).addChild(function() {
                return $jConstruct('button', {
                    id: 'formCancel',
                    text: 'cancel',
                }).event('click', function() {
                    $.colorbox.close();
                });
            });
        });
    },
    
    mDiv: function (element) { //A generic mutable JSON Div.
        return {
            type: 'div',
            id: element.id,
            text: element.text,
            functions: [element.css, element.event],
            children: undefined !== element.children ? element.children : undefined,
        };
    },
    
    mTxt: function (element) { //A generic mutable JSON Text Box.
        return {
            type: 'textbox',
            id: element.id,
            text: element.text,
            functions: [element.css, element.event],
            children: undefined !== element.children ? element.children : undefined,
        };
    },
    
    genEvnt: function (prop) {
        return {
            type: 'div',
            id: undefined !== prop.id ? prop.id : undefined,
            class: undefined !== prop.class ? prop.class : undefined,
            text: undefined !== prop.text ? prop.text : undefined,
            functions: [function () {
                if(dataObjs.slctdObj == prop.id) { //if there was an update, the object would be hilighted blue.
                    $('#'+prop.id).css({
                        'background-color': $p('blue'),
                    });
                }
                $('#'+prop.id).mouseover(function () {
                    var color = 'midgray';
                    if(dataObjs.slctdObj == prop.id) {
                        color = 'blue';
                    }
                    $('#'+prop.id).css({
                        'background-color': $p(color),
                    });
                    $('#'+prop.id+'fromDate').css({
                        'color': 'white',
                    });
                    $('#'+prop.id+'toDate').css({
                        'color': 'white',
                    });
                }).mouseout(function () {
                    if(prop.id != dataObjs.slctdObj) {
                        $('#'+prop.id).css({
                            'background-color': 'white',
                        });
                        $('#'+prop.id+'fromDate').css({
                            'color': $p('amber'),
                        });
                        $('#'+prop.id+'toDate').css({
                            'color': $p('amber'),
                        });

                    }
                }).click(function() {
                    cmd.scheduleFocus(prop.id, prop.evntID);
                    /*$('#customColumnTitle' + prop.indx.toString()).css({
                        'display': 'block',
                    });*/
                    //if has custom element value set.
                        //set the custom column title to visible.
                    //else leave the custom column title hidden.
                });
            }],
            children: [
                //title
                forms.mDiv({
                    id: prop.id + 'pt1',
                    text: '<div id="pt1Obj'+prop.id+'">' + (undefined !== prop.pt1.text ? prop.pt1.text : undefined) + '</div>',
                    css: function () {
                        $('#'+prop.id+'pt1').css({
                            'width': '45%',
                            'height': '30px',
                            'text-align': 'left',
                            'float': 'left',
                            //'border': '1px solid black',
                        });
                        $('#pt1Obj'+prop.id).css({
                            'padding-left': '10px',
                            'width': 'auto',
                        });
                    },
                    event: function () {
                        $('#pt1Obj'+prop.id+' u').click(function() {  //only when the text is clicked. jQuery wrapped the text object with <u></u>.
                            $('#pt1Obj'+prop.id).remove(); //remove for mutation.
                            appendHTML(forms.mTxt({ //mutates to this.
                                id: 'evntEditBx',
                                text: prop.pt1.raw,
                                css: function() {
                                    $('#evntEditBx').css({
                                        'width': 'inherit',
                                        'text-align': 'left',
                                        'color': $p('purple'),
                                    });
                                },
                                event: function () {
                                    $('#evntEditBx').focus(function() {
                                        //$('#evntEditBx')[0].value = '';
                                        $('#evntEditBx').select();
                                        dataObjs.slctdObj = prop.id+'pt1';
                                    }).blur(function () {
                                        if($('#evntEditBx')[0].value != prop.pt1.raw && $('#evntEditBx')[0].value !== '') {
                                            $v().events()[prop.indx].strScheduleTitle = $('#evntEditBx')[0].value; //edit object title.
                                            cmd.update(prop.indx); //comment out if debugging so db wont be hit. <-- saves current state to the db.
                                        } else {
                                            $('#evntEditBx').remove(); //if no changes to be made, simply return the original object state.
                                            appendHTML(forms.genEvnt(prop).children[0], '#'+prop.id+"pt1"); //add back original object.
                                            cmd.events.checkStatus(prop.indx, true);
                                        }
                                    });
                                }
                            }), '#'+prop.id+"pt1");
                            $('#evntEditBx').focus();
                        });
                    }
                }),
                
                //date object 
                $jConstruct('div', {
                    id: prop.id + 'pt15',
                }).css({
                    'width': '25%',
                    'height': '30px',
                    'text-align': 'left',
                    'float': 'left',
                    //'border': '1px solid black',
                }).addChild($jConstruct('div', {
                    id: 'pt1Date' + prop.id,
                    text: '<a>' + prop.pt15.text + '</a>',
                }).addFunction(function() {
                    $('#pt1Date'+prop.id+' a').click(function() { //opens date picker object when the text is clicked.
                        $.colorbox({html: '<div id="cbDateEdit"></div>', width: '350', height: '410px'});
                        appendHTML(forms['datePicker'](prop.indx), '#cbDateEdit');
                    });
                })),

                //close button
                $jConstruct('div', {
                    id: prop.id + 'pt2',
                    text: undefined !== prop.pt2.text ? '<a>'+prop.pt2.text+'</a>' : undefined,
                }).event('click', function() {
                    $v().events()[prop.indx].blnActive = !($v().events()[prop.indx].blnActive);
                    cmd.update(prop.indx);
                }).css({
                    'width': '15%',
                    'height': '30px',
                    'float': 'left',
                    //'border': '1px solid black',
                }),

                $jConstruct('div', {
                    id: 'btnRemove' + prop.id,
                    class: 'maxMinBtn',
                    text: '<b>X</b>',
                }).event('click', function() {
                    confirmDel(prop.indx);
                }).css({
                    'background-color': $p('lightAmber'),
                    'float': 'right',
                }),

                //description
                (function() {
                    var container = $jConstruct('div').css({
                        'width': '100%',
                        'height': '25px',
                        'text-align': 'left',
                        'float': 'left',
                        'padding-left': '10px',
                        //'border': '1px solid black',
                    });

                    var editable = $jConstruct('div', {
                        id: 'description'+prop.id,
                        text: (undefined !== prop.pt0.text ? prop.pt0.text : undefined),
                    }).event('click', function() {
                        if(editable.type == 'div') {
                            editable.type = 'textbox';
                            editable.text = prop.pt0.raw;
                            editable.refresh().state.done(function() {
                                $('#'+editable.id).select();
                                $('#'+editable.id).css({
                                    'color': $p("purple"),
                                    'width': '90%',
                                });
                            });
                            
                        }
                        dataObjs.slctdObj = prop.id+'pt0';
                    }).event('blur', function() {
                        if(editable.type == 'textbox') {
                            if($('#'+editable.id)[0].value != prop.pt0.raw && $('#'+editable.id)[0].value !== '') {
                                $v().events()[prop.indx].strScheduleDescription = $('#'+editable.id)[0].value; //edit object description.
                                cmd.update(prop.indx); //comment out if debugging so db wont be hit. <-- saves current state to the db.
                            } else {
                                editable.text = (undefined !== prop.pt0.text ? prop.pt0.text : undefined); //if no edits to be made, just return the original state.
                                editable.type = 'div',
                                editable.refresh(); //add back original object.
                                cmd.events.checkStatus(prop.indx, true);
                            }
                            
                        }
                    }).css({
                        'color': '#241DAB',
                        'display': 'inline', //makes sure that only the text will fire the click event.
                    });

                    container.addChild(editable);
                    return container;
                })(),

                //custom element creator.
                (function() { 
                    var text = prop.customElement.text;

                    /*
                        need to make the title refresh somehow without the refresh function,
                        unless I include the latest version of jsonHTML.
                    */

                    if(prop.customElement.raw.length > 0) {
                        console.log('custom title:', text);
                        var tmp = text.length > 7 ? text.substring(0, 6) + '...' : text;
                        var customTitleObject = arrdb.get('customFieldHeader');
                        //var customTitleObject = forms.defaultEvntTime.children[7];
                        if(customTitleObject.hasOwnProperty('children')) {
                            customTitleObject.children[customTitleObject.children.length] = $jConstruct('div', {
                                text: tmp,
                                id: 'customColumnTitle' + prop.indx.toString(),
                            }).css({
                                'display': 'none',
                            });
                        } else {
                            console.log('add custom tile:', customTitleObject);
                            customTitleObject.addChild($jConstruct('div', {
                                text: tmp,
                                id: 'customColumnTitle' + prop.indx.toString(),
                            }).css({
                                'display': 'none',
                            }));
                        }
                    }

                    var txtBx = $jConstruct('textbox', {
                        text: prop.customElement.text,
                    }).event('focus', function() {
                        txtBx.css({ //set font to black when object is in use.
                            'color': 'black',
                        });
                        $('#'+this.id).select();
                    }).event('focusout', function() {
                        //if text in textbox changed, and is not empty:
                        if($('#'+this.id)[0].value != text && $('#'+this.id)[0].value.length != 0) { 
                            //update local object with current value
                            $v().events()[prop.indx].strCustomFieldTitle = $('#'+this.id)[0].value; //edit object value.
                            var customColumn = arrdb.get('customFieldHeader');
                            //update the custom column text element with new text.
                            var update = function(txt) {
                                console.log('update function:', customColumn);
                                for(var i = 0; i < customColumn.children.length; ++i) {
                                    //find the specific object.
                                    if(customColumn.children[i].text == 'customColumnTitle' + prop.indx.toString()) {
                                        //update the text for the custom column title.
                                        customColumn.children[i].text = txt;
                                        customColumn.children[i].refresh();
                                        return true; //a successful update
                                    }
                                }
                                return false; //could not update anything, return false.
                            }
                            //create a new custom column name.
                            var insertNew = function(txt) {
                                if(customColumn.hasOwnProperty('children')) {
                                    customColumn.children[customColumn.children.length] = $jConstruct('div', {
                                        text: txt,
                                        id: 'customColumnTitle' + prop.indx.toString(),
                                    });
                                    customColumn.refresh();
                                }
                            }
                            //if update failes, insert a new object.
                            if(!update($v().events()[prop.indx].strCustomFieldTitle)) {
                                var textObj = $v().events()[prop.indx].strCustomFieldTitle;
                                textObj = textObj.length > 6 ? textObj.substring(0, 7) + '...' : textObj;
                                insertNew(textObj);
                            }
                            //save new custom column name.
                            cmd.update(prop.indx); //comment out if debugging so db wont be hit. <-- saves current state to the db.
                            console.log('updated:', $v().events()[prop.indx]);
                            //show the hidden column.
                            for(var i = 0; i < $v().times().length; ++i) {
                                $('#txtBxCustom'+i).css({
                                    'visibility': 'visible',
                                });
                            }
                            //leave text in text box black.  
                        } else if($('#'+this.id)[0].value.length == 0) { //if it is left empty.
                            var result = confirm("Click OK if you wish to remove the entire custom column and it's data.");
                            if(result) {
                                $('#'+txtBx.id)[0].value = 'Activate custom field';
                                $v().events()[prop.indx].strCustomFieldTitle = "";
                                cmd.update(prop.indx);
                                for(var i = 0; i < $v().times().length; ++i) {
                                    $('#txtBxCustom'+i)[0].value = "";
                                    $('#txtBxCustom'+i).css({ //hide the column.
                                        'visibility': 'hidden',
                                        'color': 'gray', //if column is re-enabled, everything will still look normal in terms of color.
                                    });
                                    //only use update command on those that need to have it's value changed.
                                    if($('#txtBxCustom'+i)[0].value != 'custom') { //if there is data to update.
                                        //update the db so that all of the data is cleared.
                                        $project.update('scheduleItemTextBoxUpdater')({
                                            color: $p('purple'), //change text to purple to indicate that update has finished.
                                            indx: i,
                                            property: 'strCustomField',
                                            txtBxID: 'txtBxCustom'+i,
                                        }).done(function(input) {
                                            console.log('cell update complete status', input);
                                            //$('#txtBxCustom'+i)[0].value = 'custom'; //so that if re-enabled, will show text 'custom.'                                    
                                        });
                                    } else {
                                        $('#txtBxCustom'+i)[0].value = 'custom'; //so that if re-enabled, will show text 'custom.'                                    
                                    }
                                }
                            } else {
                                $('#'+txtBx.id)[0].value = prop.customElement.text;
                            }
                        } else { //if the text did not change, is still default, or now empty:
                            $('#'+txtBx.id)[0].value = prop.customElement.text;
                        }
                        //change font color back to default when no longer being modified:
                        txtBx.css({
                            'color': 'gray',
                        });
                    }).css({
                        'color': 'gray',
                    });
                    return txtBx;
                })(),

                (function() { //the displayed date object.
                    var fromDate = $jConstruct('div', {
                        id: prop.id + 'fromDate',
                        text: cmd.time.removeISOTimeZone(prop.dates[0], true).toDateString().substring(4, 10) + ', ' + cmd.time.removeISOTimeZone(prop.dates[0], true).toLocaleTimeString(), 
                    }).css({
                        'float': 'left',
                        'color': $p('amber'),
                    }).event('click', function() {
                        $.colorbox({html: '<div id="cbDateEdit"></div>', width: '350px', height: '170px'});
                        appendHTML(forms['dateTimeAlpha']('Pick a new start date', function(dt) {
                            //dt.setDate(dt.getDate()-1); //offset the change.
                            $v().events()[prop.indx].dtOnLineFilledStartDate = cmd.time.IEremoveISOTimeZone(dt).toISOString();
                            cmd.update(prop.indx, $v().events()[prop.indx].indxScheduleID); //updates the data, second parameter focuses the object.
                            $.colorbox.close();
                        }), '#cbDateEdit');
                    });

                    var filler = $jConstruct('div', {
                        id: prop.id + 'filler',
                        text: ' - ',
                    }).css({
                        'float': 'left',
                        'margin-right': '5px',
                        'margin-left': '5px',
                    });

                    var toDate = $jConstruct('div', {
                        id: prop.id + 'toDate',
                        text: cmd.time.removeISOTimeZone(prop.dates[1], true).toDateString().substring(4, 10) + ', ' + cmd.time.removeISOTimeZone(prop.dates[1], true).toLocaleTimeString(),
                    }).css({
                        'float': 'left',
                        'color': $p('amber'),
                    }).event('click', function() {
                        $.colorbox({html: '<div id="cbDateEdit"></div>', width: '350', height: '170px'});
                        appendHTML(forms['dateTimeAlpha']('pick a new end date', function(dt) {
                            $v().events()[prop.indx].dtOnLineFilledEndDate = cmd.time.IEremoveISOTimeZone(dt).toISOString(); //11:55PM
                            cmd.update(prop.indx, $v().events()[prop.indx].indxScheduleID); //updates the data, second parameter focuses the object.
                            $.colorbox.close();
                        }), '#cbDateEdit');
                    });

                    return $jConstruct('div', {
                        id: prop.id + 'reservationRange',
                        //text: '<div>Schedule reservation active through:</div>',
                        title: 'Schedule is active through...',
                    }).css({
                        'float': 'right',
                        'font-size': '10px',
                        'display': 'inline-block',
                        'margin-right': '25%',
                    }).addChild(fromDate).addChild(filler).addChild(toDate);
                })(),
            ]
        };
    },

    genericDTPKR: function(obj, func, additionalDiv) {
        var dPicker = $jConstruct('div').event('datepicker');

        var submitBtn = $jConstruct('button', {
            text: 'submit',
        }).event('click', function() {
            func($('#'+dPicker.id).datepicker('getDate'));
        });

        var cancelBtn = $jConstruct('button', {
            text: 'cancel',
        }).event('click', function() {
            $.colorbox.close();
        });

        var dPBtns = $jConstruct('div').addChild(submitBtn).addChild(cancelBtn);
        
        return (function() {
            if(additionalDiv) {
                return $jConstruct('div', {
                    'text': '<h4>' + obj + '</h4>',
                }).css({
                    'text-align': 'center',
                }).addChild(dPicker).addChild(additionalDiv).addChild(dPBtns);
            } else {
                return $jConstruct('div', {
                    text: '<h4>' + obj + '</h4>',
                }).css({
                    'text-align': 'center',
                }).addChild(dPicker).addChild(dPBtns);            
            }
        })();
    },

    datePicker: function (indx) {
        return forms.genericDTPKR('Pick your new Schedule date', function(dt) {
            var d = dataObjs.clearTime(new Date(dt));
            $v().events()[indx].dtScheduleDate = $dt.write(d);
            $v().events()[indx].dtOnLineFilledEndDate = $dt.write(dataObjs.timeMidnight(d));
            cmd.update(indx, $v().events()[indx].indxScheduleID); //updates the data, second parameter focuses the object.
            $.colorbox.close();

        });
    },
    
    confirmPopUp: function(properties) {
        return $jConstruct('div', {
                id: 'cbDel',
                class: 'container',
                text: properties.text,
            }).addChild($jConstruct('button', { //The Cancel button
                id: 'btnCancel',
                text: 'Cancel',
            }).css({
                'float': 'right',
            }).event('click', function() {
                $.colorbox.close();
            })).addChild($jConstruct('button', { //The Yes button
                id: 'btnOk',
                text: 'Yes',
            }).css({
                'float': 'right',
            }).event('click', function() {
                properties.func();
            }));
    },

    defaultEvntTime: (function() {
        var main = $jConstruct('div', {
            id: 'defaultEvent',
            class: 'fooTimes',
        }).css({
            'border-top': '1px solid ' + $p('darkBlue'),
            'background-color': '#C5CCD9',
            'height': '26px',
            'margin-top': '10px',
            'display': 'none',
        });
        main.addChild($jConstruct('div', {
            id: 'statusContainer',
        }).css({
            'float': 'left',
            'text-align': 'center',
            'width': '30px',
            'height': 'auto',
        }).addChild($jConstruct('checkbox', {
            id: 'chkdIn',
            title: 'If visible, and checked, coach/parent check-in is complete',
        }).addFunction(function() {
            $('#chkdIn').prop('checked', true);
        })));
        main.addChild($jConstruct('div', {
            id: 'resrvd',
            class: 'reservationKey',
            text: '<b>R</b>',
            title: 'If blue, schedule time is a reservation style.',
        }).css({
            'background-color': $p('blue'), //'#D6B318'
            'border': '1px solid ' + $p('darkBlue'),
        }));
        main.addChild($jConstruct('div', {
            id: 'timebox',
            text: 'Time',
        }).css({
            'color': 'black',
            'width': '100px',
            'text-align': 'center',
            'float': 'left',
        }));
        main.addChild($jConstruct('div', {
            id: 'namebx',
            text: 'Group Name',
        }).css({
            'color': 'black',
            'width': '155px',
            'text-align': 'center',
            'float': 'left',
        }));
        main.addChild($jConstruct('div', {
            id: 'division',
            text: 'division',
        }).css({
            'color': 'black',
            'width': '100px',
            'text-align': 'center',
            'float': 'left',
        }));
        main.addChild($jConstruct('div', {
            id: 'defaultCoach',
            text: 'coach',
        }).css({
            'color': 'black',
            'width': '100px',
            'text-align': 'center',
            'float': 'left',
        }));
        main.addChild($jConstruct('div', {
            id: 'defaultID',
            text: '#',
        }).css({
            'color': 'black',
            'width': '80px',
            'text-align': 'center',
            'float': 'left',
        }));
        main.addChild($jConstruct('div', {
            id: 'customFieldHeader',
        }).css({
            'color': 'black',
            'width': '60px',
            'text-align': 'center',
            'float': 'left',
        }));
        main.addChild($jConstruct('button', {
            id: 'btnAddTimeToEvent',
            text: 'Add Time',
            title: 'Add a time to the schedule.',
        }).css({
            'border-radius': '5px',
            'background-color': $p('blue'),
            //'border': '1px solid '+$p('darkBlue'),
            'margin-right': '5px',
            'color': 'white',
            'width': '100px',
            'height': '23px',
            'float': 'right',
            'cursor': 'pointer',
            'line-height': '20px',            
        }).event('click', function() {
            $.colorbox({html: '<div id="tmp"></div>', width: '350px', height: '450px'});
            appendHTML(forms['addTimeForm']({
                indx: 0,
            }), '#tmp');
        }));
        return main;
    })(),

    defEvntTimes: function (options) { //The schedule time grid layers.
        return {
            type: 'div',
            id: 'fooTimes' + options.cnt,
            class: 'fooTimes',
            title: 'Applies to: ' + $v().events()[parseInt(dataObjs.slctdObj.substring(3, dataObjs.slctdObj.length))].strScheduleTitle + '  ' + new Date($v().events()[parseInt(dataObjs.slctdObj.substring(3, dataObjs.slctdObj.length))].dtScheduleDate).toLocaleDateString(),
            functions:[function() {
                $('#fooTimes'+options.cnt).mouseover(function() {
                    $('#fooTimes'+options.cnt).css({
                        'background-color': $p('blue'),
                        //'border-bottom': '1px solid #32B7CC',
                    });
                }).mouseout(function() {
                    $('#fooTimes'+options.cnt).css({
                        'background-color': 'white',
                        //'border-bottom': '1px solid black',
                    });
                }).css({
                    'height': '26px',
                });
            }],
            children: [
                {
                    type: 'div',
                    id: 'statusContainer' + options.cnt,
                    functions: [function() {
                        $('#statusContainer' + options.cnt).css({
                            'float': 'left',
                            //'border': '1px solid black',
                            'text-align': 'center',
                            'width': '30px',
                            'height': 'auto',
                        });
                    }],
                    children: [
                        {
                            type: 'checkbox',
                            id: 'chkdIn' + options.cnt,
                            title: options.checked ? 'Has been checked.' : 'Has NOT been checked.',
                            functions: [function() {
                                if(undefined !== options.checked) { //makes sure there are not any bugs.
                                    if(options.checked) {
                                        $('#chkdIn'+options.cnt).show(); //make sure it is visible.
                                        $('#chkdIn'+options.cnt).attr('checked','checked');
                                    } else {
                                        $('#chkdIn'+options.cnt).hide(); //dont show the checkbox at all.
                                    }
                                }
                            }]
                        },
                    ]
                },

                {
                    type: 'div',
                    id: 'resrvd' + options.cnt,
                    class: 'reservationKey',
                    text: '<b>R</b>',
                    title: options.reserved ? 'Reserved' : 'NOT Reserved',
                    functions: [function() {
                        if(undefined !== options.reserved) {
                            if(options.reserved) { //switches the color of the reservation key.
                                $('#resrvd'+options.cnt).css({
                                    'background-color': $p('blue'),
                                    'border': ('1px solid '+$p('darkBlue')),
                                });
                            } else {
                                $('#resrvd'+options.cnt).css({
                                    'background-color': $p('gray'),
                                    'border': ('1px solid'+$p('darkBlue')),
                                });
                            }
                        } else {
                            $('#resrvd'+options.cnt).remove();
                        }
                    }]
                },

                {
                    type: 'div',
                    id: 'fooTopRow' + options.cnt,
                    functions: [function() {
                        $('#fooTopRow' + options.cnt).css({
                            //'float': 'left',
                            'text-align': 'left',
                            'width': 'auto',
                            'height': 'auto',
                            //'border-radius': '5px',
                        });
                    }],
                    children: [
                        { //dtDateTime
                            type: 'textbox',
                            id: 'txtBxTime' + options.cnt,
                            class: 'txtBxTimes',
                            text: 'time',
                            functions: [function() {
                                var date = new Date($dt.read(options.time));
                                tgglTxtBx('txtBxTime' + options.cnt, $dt.write(date).toLocaleTimeString(), 'time', true);
                                if(undefined !== $dt.read(options.time) && '' !== $dt.read(options.time) && null !== $dt.read(options.time)) {
                                    $('#txtBxTime'+options.cnt)[0].value = $dt.write(date).toLocaleTimeString();
                                    $('#txtBxTime'+options.cnt).css({
                                        'color': $p('purple'),
                                    });
                                }
                                $('#txtBxTime'+options.cnt).blur(function () {
                                    if($dt.write(date).toLocaleTimeString() != $('#txtBxTime'+options.cnt)[0].value) {
                                        //var dtTime = $dt.parse($('#txtBxTime5')[0].value);
                                        var dtTime = $dt.parse($('#txtBxTime'+options.cnt)[0].value);
                                        if(cmd.rgbToHex($('#txtBxTime'+options.cnt)[0].style['color']).toUpperCase() == $p('red')){ //if it changed!
                                            if(dtTime.toLocaleTimeString() != "Invalid Date") {
                                                var type = cmd.detectBrowser();
                                                type = type.substring(0, type.indexOf(' '));
                                                //IE tries several times to add time zone hours to time... this stops it from doing that
                                                if(type == 'IE') {
                                                    dtTime = new Date(dtTime.getTime() - (dtTime.getTimezoneOffset() * 60000));
                                                }
                                                //turn to ISO string and remove the .000Z from the string.
                                                dtTime = dtTime.toISOString();
                                                dtTime = dtTime.substring(0, dtTime.indexOf('Z')-4) + dtTime.substring(dtTime.indexOf('Z')+1, dtTime.length);
                                                $project.update('scheduleItemTextBoxUpdater')({ //does the update for me.
                                                    color: $p('purple'),
                                                    indx: options.cnt,
                                                    property: 'dtDateTime',
                                                    txtBxID: 'txtBxTime'+options.cnt,
                                                    dt: dtTime, //send it.
                                                });
                                            }
                                            //update the text box containing the time.
                                            $('#txtBxTime'+options.cnt)[0].value = $dt.read(new Date(dtTime)).toLocaleTimeString();
                                        }
                                    }
                                });
                            }]
                        },
                         //strGroupName
                        $jConstruct('textbox', {
                            id: 'txtBxName' + options.cnt,
                            class: 'txtBxTimes',
                            text: 'name',
                        }).css({
                            'width': '155px',
                        }).addFunction(function() {
                            if(!(options.reserved)) {
                                tgglTxtBx('txtBxName'+options.cnt, options.name, 'name', true); //set true for editable
                            } else {
                                $('#txtBxName'+options.cnt).attr('disabled', 'disabled').css({
                                    'color': $p('gray'),
                                });
                            }
                            if(undefined !== options.name && '' !== options.name && null !== options.name) {
                                $('#txtBxName'+options.cnt)[0].value = options.name;
                                $('#txtBxName'+options.cnt).css({
                                    'color': $p('purple'),
                                });
                            }
                        }).event('blur', function() {
                            if($p('color')('txtBxName'+options.cnt) == $p('red')) {
                                $project.update('scheduleItemTextBoxUpdater')({ //does the update for me.
                                    color: $p('purple'),
                                    indx: options.cnt,
                                    property: 'strGroupName',
                                    txtBxID: 'txtBxName'+options.cnt,
                                });
                            }
                        }),

                        //strGroupDivision
                        $jConstruct('textbox', {
                            id: 'txtBxDivision' + options.cnt,
                            class: 'txtBxTimes',
                            text: 'division',
                        }).addFunction(function() {
                            if(!(options.reserved)) {
                                tgglTxtBx('txtBxDivision'+options.cnt, options.division, 'division', true); //set true for editable
                            } else {
                                $('#txtBxDivision'+options.cnt).attr('disabled', 'disabled').css({
                                    'color': $p('gray'),
                                });
                            }
                            if(undefined !== options.division && '' !== options.division && null !== options.division) {
                                $('#txtBxDivision'+options.cnt)[0].value = options.division;
                                $('#txtBxDivision'+options.cnt).css({
                                    'color': $p('purple'),
                                });
                            }
                        }).event('blur', function() {
                            if($p('color')('txtBxDivision'+options.cnt) == $p('red')) {
                                $project.update('scheduleItemTextBoxUpdater')({
                                    color: $p('purple'),
                                    indx: options.cnt,
                                    property: 'strGroupDivision',
                                    txtBxID: 'txtBxDivision'+options.cnt,
                                });
                            }
                        }),

                        //strGroupInstructor
                        $jConstruct('textbox', {
                            id: 'txtBxCoach' + options.cnt,
                            class: 'txtBxTimes',
                            text: 'coach',
                        }).addFunction(function() {
                            if(!(options.reserved)) {
                                tgglTxtBx('txtBxCoach'+options.cnt, options.coach, 'coach', true); //set true for editable
                            } else {
                                $('#txtBxCoach'+options.cnt).attr('disabled', 'disabled').css({
                                    'color': $p('gray'),
                                });
                            }
                            if(undefined !== options.coach && '' !== options.coach && null !== options.coach) {
                                $('#txtBxCoach' + options.cnt)[0].value = options.coach;
                                $('#txtBxCoach'+options.cnt).css({
                                    'color': $p('purple'),
                                });
                            }
                        }).event('blur', function() {
                            if($p('color')('txtBxCoach'+options.cnt) == $p('red')) {
                                $project.update('scheduleItemTextBoxUpdater')({
                                    color: $p('purple'),
                                    indx: options.cnt,
                                    property: 'strGroupInstructor',
                                    txtBxID: 'txtBxCoach'+options.cnt,
                                });
                            }
                        }),

                        //intScheduleOverRideNumPaticipants
                        $jConstruct('textbox', {
                            id: 'txtBxID' + options.cnt,
                            class: 'txtBxTimes',
                            text: "0",
                        }).addFunction(function() {
                            if(!(options.reserved)) {
                                tgglTxtBx('txtBxID'+options.cnt, options.id, "0", true); //set true for editable
                            } else {
                                $('#txtBxID'+options.cnt).attr('disabled', 'disabled').css({
                                    'color': $p('gray'),
                                });
                            }
                                
                            $('#txtBxID' + options.cnt).css({
                                'width': '60px',
                            });
                            //if not undefined, not empty string, not null, not 0
                            if(undefined !== options.id && '' !== options.id && null !== options.id && 0 !== options.id) {
                                $('#txtBxID'+options.cnt)[0].value = options.id;
                                $('#txtBxID'+options.cnt).css({
                                    'color': $p('purple'),
                                });
                            }
                        }).event('blur', function() {
                            if($p('color')('txtBxID'+options.cnt) == $p('red')) {
                                $project.update('scheduleItemTextBoxUpdater')({
                                    color: $p('purple'),
                                    indx: options.cnt,
                                    property: 'intScheduleOverRideNumPaticipants',
                                    txtBxID: 'txtBxID'+options.cnt,
                                });
                            }
                        }),

                        //strCustomField
                        $jConstruct('textbox', {
                            id: 'txtBxCustom' + options.cnt,
                            text: (function() { //if there is a value already, use it.
                                var text = 'custom'; //default setting.
                                if($v().times()[options.cnt].strCustomField.length > 0) { //if there is a value set for this field
                                    text = $v().times()[options.cnt].strCustomField;
                                }
                                return text;
                            })(),
                            class: 'txtBxTimes',
                        }).addFunction(function() {
                            //console.log('this scope:', options.cnt);
                            if($v().events()[parseInt(dataObjs.slctdObj.substring(3,4))].strCustomFieldTitle.length > 0) {
                                $('#txtBxCustom'+options.cnt).css({
                                    'visibility': 'visible',
                                });
                            } else {
                                $('#txtBxCustom'+options.cnt).css({
                                    'visibility': 'hidden',
                                });
                            }
                            if($('#txtBxCustom'+options.cnt)[0].value != 'custom') {
                                $('#txtBxCustom'+options.cnt).css({ //if it already has a value, change the color.
                                    'color': $p('purple'),
                                });
                            }
                        }).event('click', function() {
                            console.log(this.id, 'was clicked!');
                            $('#'+this.id).css({
                                'color': 'black',
                            });
                            $('#'+this.id).select(); //hilight all of the text for easy edit.
                        }).event('blur', function() {

                            /*
                                Need to get the updating function to be called below, and have all these
                                status indicators synced to the color of the text box fonts.

                                Need to identify how the other text boxes are updated, and duplicate this
                                here.
                            */

                            $('#'+this.id).css({ //change text color to red, until update is finished.
                                'color': 'red',
                            });
                            //update the field
                            $project.update('scheduleItemTextBoxUpdater')({
                                color: $p('purple'), //change text to purple to indicate that update has finished.
                                indx: options.cnt,
                                property: 'strCustomField',
                                txtBxID: this.id,
                            }).done(function(input) {
                                console.log('cell update complete status', input);
                            });
                        }),

                        //event time close button
                        $jConstruct('div', {
                            id: 'closeBtn' + options.cnt,
                            class: 'maxMinBtn',
                            text: '<b>X</b>',
                        }).css({
                            'background-color': $p('lightAmber'),
                        }).event('click', function() {
                            confirmTimeDel(options.cnt);
                        }),

                        //event time maximize button.
                        $jConstruct('div', {
                            id: 'maximizeBtn' + options.cnt,
                            class: 'maxMinBtn',
                            text: '<b>i</b>',
                        }).css({
                            'background-color': 'green',
                        }),
                    ],
                },
            ],
        };
    },
    
    addTimeForm: function(obj) {
        return {
            type: 'div',
            id: 'addTimeDiv' + obj.indx,
            functions:[function() {
                $('#addTimeDiv'+obj.indx).css({
                    'width': '100%', //100% of colorbox size.
                    'height': '100%', //100% of colorbox size.
                    'font-family': 'sans-serif',
                    'text-align': 'center',
                }); 
            }],
            children: [
                { //header
                    type: 'div',
                    text: '<h3> Add schedule time </h3>'
                },
                {
                    type: 'div',
                    id: 'textboxContainer',
                    functions:[function () {
                        $('#textboxContainer').css({
                            'width': '200px',
                            'text-align': 'left',
                            'margin-left': '30px',
                        })
                    }],
                    children: [
                        { //blnOnlineFilledAllowed
                            type: 'checkbox',
                            id: 'reservedCheckBox',
                            text: 'reservation?',
                            functions: [function () {
                                $('#reservedCheckBox').click(function () {
                                    //if checked, hide all objects that do not have to do with a reservation object.
                                    //else, show all objects that have to do with a static object.
                                    if($('#reservedCheckBox')[0].checked) {
                                        $('#groupNameBox').hide();
                                        $('#divisionBox').hide();
                                        $('#coachBox').hide();
                                        $('#groupInstructorBox').hide();
                                        $('#groupCodeBox').hide();
                                        $('#notesBox').hide();
                                    } else {
                                        $('#groupNameBox').show();
                                        $('#divisionBox').show();
                                        $('#coachBox').show();
                                        $('#groupInstructorBox').show();
                                        $('#groupCodeBox').show();
                                        $('#notesBox').show();
                                    }
                                })
                            }]
                        },
                        {//StrGroupName
                            type: 'textbox',
                            id: 'groupNameBox',
                            text: 'Group Name',
                            functions:[function () {
                                $('#groupNameBox').css({
                                    'color': $p("gray"),
                                })
                                tgglTxtBx('groupNameBox', /*'Group Name',*/ undefined, 'Group Name');
                            }]
                        },
                        {//strGroupInstructor
                            type: 'textbox',
                            id: 'groupInstructorBox',
                            text: 'Group Instructor',
                            functions:[function () {
                                $('#groupInstructorBox').css({
                                    'color': $p("gray"),
                                });
                                tgglTxtBx('groupInstructorBox', undefined, 'Group Instructor');
                            }],
                        },
                        {//strOrganizationEventGroupCode
                            type: 'textbox',
                            id: 'groupCodeBox',
                            text: 'Group Code',
                            functions: [function () {
                                $('#groupCodeBox').css({
                                    'color': $p("gray"),
                                });
                                tgglTxtBx('groupCodeBox', undefined, 'Group Code');
                            }],
                        },
                        {//StrGroupDivision
                            type: 'textbox',
                            id: 'divisionBox',
                            //class: 'txtCenter',
                            text: 'Group Division',
                            functions: [function () {
                                $('#divisionBox').css({
                                    'color': $p("gray"),
                                });
                                tgglTxtBx('divisionBox', undefined, 'Group Division');
                            }]
                        },
                        {//strGroupInstructor
                            type: 'textbox',
                            id: 'coachBox',
                            text: 'Coach',
                            functions: [function () {
                                $('#coachBox').css({
                                    'color': $p("gray"),
                                });
                                tgglTxtBx('coachBox', undefined, 'Coach');
                            }],
                        },
                        
                        {//dtDateTime <--update time part.
                            type: 'textbox',
                            id: 'timeBox',
                            name: 'time',
                            text: 'click to set time.',
                            functions: [function () {
                                $('input[name="time"]').ptTimeSelect();
                                $('#timeBox').focus(function () {
                                    //change color to purple, and clear the box.
                                    $('#cboxOverlay').css({ //so the time select will appear over the shadow.
                                        'z-Index': '8',
                                    });
                                    $('#colorbox').css({ //so the time select will appear over the colorbox.
                                        'z-Index': '9',
                                    });
                                }).css({
                                    'color': $p('purple'),
                                });
                            }]
                        },

                        {//strNotes
                            type: 'textarea',
                            id: 'notesBox',
                            text: 'Notes...',
                            rows: '6',
                            cols: '20',
                            functions: [function () {
                                $('#notesBox').css({
                                    'color': $p("gray"),
                                });
                                tgglTxtBx('notesBox', undefined, 'Notes...');

                            }]
                        },
                        {//intScheduleOverRideNumPaticipants
                            type: 'spinner',
                            id: 'numParticipantsSpnr',
                            text: 'Participants',
                            min: 0,
                            max: 100,
                            functions: [function () {
                                $('#numParticipantsSpnr')[0].value = "0";
                            }]
                        },
                        /*{//how many times to repeat the data.
                            type: 'spinner',
                            id: 'duplicateSpnr',
                            text: 'copies:',
                            min: 0,
                            max: 30,
                            functions: [function () {
                                $('#duplicateSpnr')[0].value = "1";
                            }]
                        },*/
                    ]
                },
                {
                    type: 'div',
                    id: 'buttonContainer',
                    //functions: [],
                    children: [
                        {//submit the form.
                            type: 'button',
                            id: 'submitBtn',
                            text: 'submit',
                            functions: [function () {
                                $('#submitBtn').click(function() { //submit the form data to the data base... make sure to pull the selected object div id.
                                    function getText(value, defVal) {
                                        return value !== defVal ? value : "";
                                    }
                                    //generate the proper json object to send to the create function.
                                    var strJson = dataObjs.templates.schedule();
                                    strJson.blnOnlineFilledAllowed = $('#reservedCheckBox')[0].checked;
                                    strJson.strGroupName = getText($('#groupNameBox')[0].value, 'Group Name');
                                    strJson.strGroupInstructor = getText($('#groupInstructorBox')[0].value, 'Group Instructor');
                                    strJson.strOrganizationEventGroupCode = getText($('#groupCodeBox')[0].value, 'Group Code');
                                    strJson.strGroupDivision = getText($('#divisionBox')[0].value, 'Group Division');
                                    strJson.strGroupInstructor = getText($('#coachBox')[0].value, 'Coach');
                                    strJson.intScheduleOverRideNumPaticipants = $('#numParticipantsSpnr')[0].value;
                                    strJson.strNotes = getText($('#notesBox')[0].value, 'Notes...');
                                    if(getText($('#timeBox')[0].value, 'time') !== "") {
                                        strJson.dtDateTime = cmd.time.IEremoveISOTimeZone($dt.parse($('#timeBox')[0].value), false).toISOString();
                                    }
                                    $project.create('scheduleItem')(strJson).done(function() { //make the new schedule item (aka time).
                                        cmd.events.checkStatus(0, true).done(function() {
                                            $.colorbox.close(); //close the loading screen.
                                        });
                                        //$.colorbox.close(); //close the color box.
                                    });
                                });
                            }]
                        },

                        $jConstruct('button', { //written in JSONHTML v0.9 - Beta
                            id: 'multiPostBtn',
                            text: 'Reservation Range',
                        }).event('click', function() {
                            //$.colorbox.close();
                            defaultColorbox('multiPostCB', 'multiPost', {
                                width: '400px',
                                height: '220px',
                            });
                        }),

                        $jConstruct('button', {
                            id: 'csvUploadBtn',
                            text: 'upload csv',
                        }).event('click', function() {
                            var title = $jConstruct('div', {
                                text: '<h2>Submit CSV<h2>',
                            }).css({
                                'font-family': 'sans-serif',
                                'text-align': 'center',
                            });
                            var box = $jConstruct('div', {
                                text: 'Note: If you have an entire row of empty cells, it is best to remove them now, or empty rows will be contained in the Schedule.',
                            }).css({
                                'width': '400px',
                                'font-family': 'sans-serif',
                                'margin': '0 auto',
                            });
                            $.colorbox({html: '<div id="cbDateEdit"></div>', width: '900px', height: '600px'});
                            title.appendTo('#cbDateEdit');
                            box.appendTo('#cbDateEdit');
                            csvSubmitFormAppendTo('#cbDateEdit');
                        }),

                        {//close the colorbox, ignore everything button.
                            type: 'button',
                            id: 'cancelBtn',
                            text: 'cancel',
                            functions: [function () {
                                $('#cancelBtn').click(function () {
                                    $.colorbox.close(); //close the colorbox.
                                });
                            }],
                        },
                    ]
                },

            ],
        };
    },

    //form repsonsible for creating multiple time objects on the fly.
    multiPost: function() { //written in JSONHTML v0.9 - Beta
        var boxCSS = {
            'color': $p('gray'),
        };

        //textboxes to fill
        var startTimeDateBox = $jConstruct('textbox', {
            text: 'Start Time',
            name: 'time0',
        }).addFunction(function() {
            $('input[name="time0"]').ptTimeSelect();
        }).css(boxCSS).event('focus', function() {
            $('#'+startTimeDateBox.id).css({
                'color': $p('purple'),
            });
            $('#cboxOverlay').css({ //so the time select will appear over the shadow.
                'z-Index': '8',
            });
            $('#colorbox').css({ //so the time select will appear over the colorbox.
                'z-Index': '9',
            });
        });

        var endTimeDateBox = $jConstruct('textbox', {
            text: 'End Time',
            name: 'time1',
        }).addFunction(function() {
            $('input[name="time1"]').ptTimeSelect();
        }).css(boxCSS).event('focus', function() {
            $('#'+endTimeDateBox.id).css({
                'color': $p('purple'),
            });
            $('#cboxOverlay').css({ //so the time select will appear over the shadow.
                'z-Index': '8',
            });
            $('#colorbox').css({ //so the time select will appear over the colorbox.
                'z-Index': '9',
            });
        });

        var numintervalBox = $jConstruct('textbox', {
            text: 'Minutes Interval',
        }).css(boxCSS).addFunction(function() {
            tgglTxtBx(numintervalBox.id, 'Minutes Interval', 'Minutes Interval', false);
        });

        var numSlotsBox = $jConstruct('textbox', {
            text: 'How many Slots',
        }).css(boxCSS).addFunction(function() {
            tgglTxtBx(numSlotsBox.id, 'How many Slots', 'How many Slots', false);
        });


        //buttons for functionality.
        var btnClose = $jConstruct('button', {
            //class: 'editBtn',
            text: 'cancel',
        }).event('click', function() {
            //$('#'+post.id).remove();
            $.colorbox.close(); //close the colorbox.
        });
        var btnSubmit = $jConstruct('button', {
            //class: 'editBtn',
            text: 'submit',
        }).event('click', function() {
            //this would submit the stuff
            //console.log($('#'+startTimeDateBox.id)[0].value, $('#'+endTimeDateBox.id)[0].value, $('#'+numintervalBox.id)[0].value, $('#'+numSlotsBox.id)[0].value);
            var obj = {
                ScheduleID: $v().events()[parseInt(dataObjs.slctdObj.substring(3, dataObjs.slctdObj.length))].indxScheduleID,
                EventID: id.event,
                StartTimeDate: cmd.time.IEremoveISOTimeZone($dt.parse($('#'+startTimeDateBox.id)[0].value), false).toISOString(),
                EndTimeDate: cmd.time.IEremoveISOTimeZone($dt.parse($('#'+endTimeDateBox.id)[0].value), false).toISOString(),
                TimeInterval: $('#'+numintervalBox.id)[0].value,
                Slots: $('#'+numSlotsBox.id)[0].value,
                PhotographerID: id.photographer,
            }
            
            $.colorbox({html: '<div id="cbDateEdit"></div>', width: '350px', height: '100px'});
            var progress = $jConstruct('div', { //construct the progress bar div.
                id: 'progressbar',
                text: 'Waiting for response...',
            }).event('progressbar', {
                value: 50,
            }).appendTo('#cbDateEdit');

            console.log(obj);
            $project.insert('scheduleItem')(obj).done(function(data) {
                if(data) {
                    console.log(data);
                }
                progress.text = 'Done!';
                progress.refresh();
                $('#'+progress.id).progressbar({
                    value: 100,
                });
                cmd.events.checkStatus(0, true).done(function() {
                    $project.draw('scheduleItems')($v().events()[parseInt(dataObjs.slctdObj.substring(3, dataObjs.slctdObj.length))].indxScheduleID);
                    setTimeout(function() {
                        $.colorbox.close();
                    }, 600); //close the progress screen.
                });
                //$.colorbox.close();
                
            });
        });
                    
        //containers to contain the objects in a div.
        var textBoxContainer = $jConstruct('div').css({
            'text-align': 'center',
        }).addChild($jConstruct('div').addChild(startTimeDateBox)).addChild($jConstruct('div').addChild(endTimeDateBox)).addChild($jConstruct('div').addChild(numintervalBox)).addChild($jConstruct('div').addChild(numSlotsBox));
        var buttonContainer = $jConstruct('div').addChild(btnClose).addChild(btnSubmit);
                    
        //main div to contain everything.
        return $jConstruct('div', {
            text: '<h3> Set Reservation Range Settings</h3>',
        }).css({
            'text-align': 'center',
        }).addChild(textBoxContainer).addChild(buttonContainer);
    },
    helpWindow: function() {

        var okBtn = $jConstruct('button', {
            text: 'ok',
        }).event('click', function() {
            $.colorbox.close();
        }).css({
            'float': 'right',
            'width': '60px',
            'height': '25px',
        });

        return $jConstruct('div', {
            text: '<h3> Need Help? </h3>',
        }).css({
            'text-align': 'center',
        }).addChild($jConstruct('div', {
            text: 'Check back here later, training videos are coming soon!',
        })).addChild(okBtn);
    },

    /*
        USE:
        $.colorbox({html: '<div id="tmp"></div>', width: '350px', height: '145px'});
        forms.dateTimeAlpha('pick stuff', function(dt) { 
          console.log(dt.toISOString());
        }).appendTo('#tmp');
    */ 
    dateTimeAlpha: function(title, func) {
        var datePicker = $jConstruct('textbox', {
            text: 'Click to pick a date',
        }).event('datepicker');

        var timePicker = $jConstruct('textbox', {
            text: 'Click to pick a time',
        }).event('ptTimeSelect').event('click', function() {
            $('#cboxOverlay').css({ //so the time select will appear over the shadow.
                'z-Index': '8',
            });
            $('#colorbox').css({ //so the time select will appear over the colorbox.
                'z-Index': '9',
            });
        });

        var btnSubmit = $jConstruct('button', {
            text: 'submit',
        }).event('click', function() {
            var d = $('#'+datePicker.id).datepicker('getDate');
            var t = $dt.parse($('#'+timePicker.id)[0].value, d);
            if(cmd.isIE()) {
                t = cmd.time.removeISOTimeZone($dt.write(cmd.time.parse($('#'+timePicker.id)[0].value, d)));
            }
            console.log('times:', d, t);
            func(t);
        });

        var btnCancel = $jConstruct('button', {
            text: 'cancel',
        }).event('click', function() {
            $.colorbox.close();
        })

        var btnContainer = $jConstruct('div').css({
            'float': 'right',
        }).addChild(btnSubmit).addChild(btnCancel);

        var pickerContainer = $jConstruct('div').css({
            'margin': '0 auto',
        }).addChild(datePicker).addChild(timePicker);

        return $jConstruct('div', {
            text: '<h4>' + title + '</h4>',
        }).css({
            'text-align': 'center',
        }).addChild(pickerContainer).addChild(btnContainer);

    },

};

function defaultColorbox(id, obj, dimens) {
    $.colorbox({html:'<div id="'+id+'"></div>', width: dimens.width, height: dimens.height});
    appendHTML(forms[obj], '#'+id);
}
