async function getTimezoneList() {
  const lsKey = 'LocalStorage:Timer.js.timezone';
  const timezoneListUrl =
    'https://raw.githubusercontent.com/dmfilipenko/timezones.json/ac0682e3af4c4d6153f7ae16705ced4967c4c6a8/timezones.json';
  let persistStr = localStorage.getItem(lsKey);

  if (!persistStr) {
    const timezoneJson = await axios.get(timezoneListUrl).then((d) => d.data);
    persistStr = JSON.stringify(timezoneJson);
    localStorage.setItem(lsKey, persistStr);
  }

  return JSON.parse(persistStr).map((t) => ({
    ...t,
    timezone: t.utc[0],
  }));
}

const DB_LOCAL_STORAGE_KEY = 'Timer.js';
class Database {
  update = async (user, data) => {
    const localDb = this.getLocal();
    const newDb = {
      ...localDb,
      [user]: data,
    };
    localStorage.setItem(DB_LOCAL_STORAGE_KEY, JSON.stringify(newDb));

    fetch('https://api.npoint.io/d4f6cf91bc447d534472', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newDb),
    });
  };

  getLocal = (user) => {
    const persistStr = localStorage.getItem(DB_LOCAL_STORAGE_KEY);
    const data = JSON.parse(persistStr || '{}');
    if (user === 'all' || !user) {
      return data;
    }
    return data[user];
  };

  get = (user) =>
    fetch('https://api.npoint.io/d4f6cf91bc447d534472/')
      .then((d) => d.json())
      .then((data) => {
        localStorage.setItem(DB_LOCAL_STORAGE_KEY, JSON.stringify(data));
        return data[user] || {};
      });
}

const urlParams = new URLSearchParams(window.location.search);
const user = urlParams.get('user');

dayjs.extend(dayjs_plugin_utc);
dayjs.extend(dayjs_plugin_timezone);
const lsKey = 'LocalStorage:Timer.js.timezone';

function createApp(timerJsData, onUpdate) {
  Vue.component('v-select', VueSelect.VueSelect);

  const app = new Vue({
    el: '#app',
    data: {
      timezoneList: [],
      timezoneCode: '',
      ...timerJsData,

      // not persist
      addTimezoneCode: '',
      addTimezoneTitle: '',
      showAddSection: false,
      isShowEditTime: false,
      timePercentage: 0,
      now: new Date(),
      sliderMaxValue: (24 * 60 * 60 - 1).toString(),
    },
    computed: {
      timezoneUTC() {
        if (this.timezoneCode && this.isShowEditTime) {
          return this.timezone.find((t) => t.abbr === this.timezoneCode)
            .timezone;
        }
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
      },
      dateByTimePercentage() {
        const i = dayjs()
          .tz(this.timezoneUTC)
          .hour(0)
          .minute(0)
          .second(this.timePercentage);

        return i;
      },
      formattedTimePercentage() {
        return this.dateByTimePercentage.format('hh:mm A');
      },
      options() {
        return Array.from(this.timezone)
          .sort((a, b) => a.offset - b.offset)
          .map((t) => ({
            value: t.abbr,
            label: `${t.text} -- ${this.dateByTimePercentage
              .tz(t.timezone)
              .format('MM/DD/YYYY, hh:mm A ')}`,
          }));
      },
      addTimezoneProps() {
        if (!this.addTimezoneCode) {
          return null;
        }
        const timezone = this.timezone.find(
          (t) => t.abbr === this.addTimezoneCode
        );
        const offsetStr = timezone.offset.toString();
        return {
          date: this.dateByTimePercentage.tz(timezone.timezone),
          title: '',
          offset: '',
        };
      },
      timeList() {
        return this.timezoneList.map(({ code, id, title }) => {
          const timezone = this.timezone.find((t) => t.abbr === code);
          const offsetStr = timezone.offset.toString();
          const date = this.dateByTimePercentage.tz(timezone.timezone);
          return {
            date,
            formattedTime: date.format('hh:mm A'),
            formattedDate: date.format('MM/DD/YYYY'),
            title: title || timezoneData.text,
            offset: offsetStr[0] === '-' ? offsetStr : `+${offsetStr}`,
            id,
          };
        });
      },
    },
    watch: {
      timezoneCode(val) {
        onUpdate({
          timezoneCode: val,
          timezoneList: this.timezoneList,
        });
      },
      timezoneList(t) {
        onUpdate({
          timezoneCode: this.timezoneCode,
          timezoneList: t,
        });
      },
    },
    methods: {
      showEditTime() {
        this.isShowEditTime = true;
      },
      addNew() {
        if (!this.addTimezoneCode) {
          return;
        }

        this.timezoneList.push({
          code: this.addTimezoneCode,
          id: Math.random().toString().slice(2),
          title: this.addTimezoneTitle,
        });
        this.addTimezoneUTC = '';
        this.addTimezoneTitle = '';
      },
      timeDoubleClick(id) {
        this.timezoneList = this.timezoneList.filter((i) => i.id !== id);
      },
      dateToTime(d) {
        return d.getHours() * 60 * 60 + d.getMinutes() * 60 + d.getSeconds();
      },
    },
    created() {
      this.timePercentage = this.dateToTime(new Date());
      setInterval(() => {
        if (!this.isShowEditTime) {
          this.timePercentage = this.dateToTime(new Date());
        }
      }, 1000);
    },
  });

  return app;
}

async function main() {
  if (!user) {
    const app = document.getElementById('app');
    app.innerHTML = '?user={userName}';
    return;
  }

  const database = new Database();

  const timezone = await getTimezoneList();

  const localData = database.getLocal(user);

  const app = createApp(
    {
      ...localData,
      timezone,
    },
    (d) => database.update(user, d)
  );

  const data = await database.get(user);

  Object.keys(data).forEach((key) => {
    app[key] = data[key];
  });
}

main();
