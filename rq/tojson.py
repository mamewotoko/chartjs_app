#! /usr/bin/env python3

import csv
import sys
import re
import json
import traceback

monthname2day = {
    'Jan': '01',
    'Feb': '02',
    'Mar': '03',
    'Apr': '04',
    'May': '05',
    'Jun': '06',
    'Jul': '07',
    'Aug': '08',
    'Sep': '09',
    'Oct': '10',
    'Nov': '11',
    'Dec': '12'
}


filter_regxp = re.compile(r'.*(/grafana/|Bot|bot|munin).*')

if __name__ == '__main__':
    events = []
    regexp = re.compile(r'^.*\[([^\[\]]*)\].*$')
    reader = csv.reader(sys.stdin, delimiter=' ', quotechar='"')
    for row in reader:
        line = ' '.join(row)
        try:
            m = regexp.match(line)
            if m is None:
                continue
            mm = filter_regxp.match(line)
            if mm is not None:
                continue
            #datepart = m.group(1)
            # date_and_offset = datepart.split(' ')
            date = row[3][1:]
            offset = '+0900'
            date = date.replace(':', '/')
            split = date.split('/')
            day = split[0]
            month = monthname2day[split[1]]
            year = split[2]
            hour = split[3]
            minute = split[4]
            sec = split[5]

            json_date = '%s%s%sT%s%s%s%s' % (year, month, day, hour, minute, sec, offset)
            # print(json_date)
            ev = {'start': json_date, 'title': line}
            status = int(row[6])
            # print('status: %s' % status)
            if 200 <= status and status < 300:
                ev['icon'] = './api/images/green-circle.png'
            elif 400 <= status and status < 500:
                ev['icon'] = './api/images/dark-red-circle.png'
            events.append(ev)
        except Exception:
            sys.stderr.write(line+"\n")
            traceback.print_exc()

    j = {'dateTimeFormat': 'iso8601', 'events': events}
    print(json.dumps(j, indent=2))
