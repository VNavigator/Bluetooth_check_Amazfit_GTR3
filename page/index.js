import { gettext } from 'i18n'

const WAKE_UP_INTERVAL_SECONDS = 30 // this value must be higher than the screen on time on app
const POLL_ALARM_PREF_ID = 'vn_bluetooth_poll_alarm'
const ALARM_SENT = 'bluetooth_alarm_sent' // flag for check the Toast meassage was sent
const APP_INSTALLED = 'bluecheck_installed'
const vibrate = hmSensor.createSensor(hmSensor.id.VIBRATE)
let timer_StopVibrate = null;
let appId = 1020908;

function showDialog(){
  const dialog = hmUI.createDialog({
    title: gettext('bluetooth'),
    auto_hide: true,
    click_linster: ({ type }) => {
      if(type==0){//cancel button
        hmFS.SysProSetInt(ALARM_SENT,0)
      }
      if(type==1){//confirm button
        hmFS.SysProSetInt(ALARM_SENT,1)
      }
      dialog.show(false)
    }
  })

  dialog.show(true)
}

function vibro(scene = 25) {
  let stopDelay = 50;
  stopVibro();
  vibrate.stop();
  vibrate.scene = scene;
  if(scene < 23 || scene > 25) stopDelay = 1300;
  vibrate.start();
  timer_StopVibrate = timer.createTimer(stopDelay, 3000, stopVibro, {});
}

function stopVibro(){
  vibrate.stop();
  if(timer_StopVibrate) timer.stopTimer(timer_StopVibrate);
}

Page({
  onInit(param) {

    stopVibro()
    //console.log(hmApp.appid)
    // verify if this launch was triggered by an alarm or not
    if(param === POLL_ALARM_PREF_ID) { 
      const existingAlarm = hmFS.SysProGetInt(POLL_ALARM_PREF_ID) // get existing alarm reference from system preferences
      if(existingAlarm) {
        // cancel existing alarm
        hmApp.alarmCancel(existingAlarm)
      }
    }

    const alarm = hmApp.alarmNew({
      file: 'page/index',
      appid: 1020908, // <YOU APP ID HERE>
      delay: WAKE_UP_INTERVAL_SECONDS,
      param: POLL_ALARM_PREF_ID
    })

    hmFS.SysProSetInt(POLL_ALARM_PREF_ID, alarm) // Save new alarm reference on system preferences

  },
  build() {
    
    if(hmBle.connectStatus() === true) {
      hmFS.SysProSetInt(ALARM_SENT,0)
      //hmApp.exit()
    } else {
      // show a message to the user / vibrate the watch
      const alarmSent = hmFS.SysProGetInt(ALARM_SENT)
      if(!alarmSent){
        showDialog()
        vibro(9)
      }
      hmFS.SysProSetInt(ALARM_SENT,1)
    }
  },
  onDestroy() {
    stopVibro() // stop any vibration
  }
})