send req to cosmos

scp requirements.txt eliotmp@cosmos.lunarc.lu.se:/home/eliotmp/eliot_project/



send plot to my comp

scp eliotmp@cosmos.lunarc.lu.se:/home/eliotmp/eliot_project/event_count_histogram.png ~/Downloads/.



Start something in the background

Running right now: 3096125

nohup python ~/eliot_project/inspect_event_counts.py > ~/eliot_project/inspect_event_counts.log 2>&1 &



Watch progress

tail -f ~/eliot_project/inspect_event_counts.log

Exit: Ctrl + C



Check if still running

ps -u $USER | grep inspect_event_counts

or

pgrep -af inspect_event_counts.py




Kill if needed:

kill PROCESS_ID



