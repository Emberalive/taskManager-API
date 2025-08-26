//this will be a separate worker that will select from the task database every minute and check if those tasks
//need to be notified.

//e.g. a user can set a date to notify them of a specific task.

//this worker will store all the tasks that are needing to be notified this day, and will send an email using another
//module dependency at the time specified