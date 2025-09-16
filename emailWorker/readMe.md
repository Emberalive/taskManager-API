# Task Notification Worker

This project implements a separate worker that monitors tasks in the database and sends notifications to users at the specified time.

## Overview

The worker performs the following:

- Runs independently of the main application.
- Polls the `task` database every minute to check for tasks that need notification.
- Stores tasks that require notification for the current day.
- Sends email notifications using a separate module dependency at the specified time.

## Features

- **Scheduled Notifications:** Users can set a date/time for a task notification.
- **Automated Polling:** The worker continuously checks the database at 1-minute intervals.
- **Email Delivery:** Notifications are sent via an integrated email module.

## How It Works

1. The worker queries the task database every minute.
2. It identifies tasks that have notifications scheduled for that day.
3. It queues these tasks for sending.
4. At the appropriate time, it sends an email to the user for each task.

**Query task database** --> **Identify tasks for notifications** --> **send email**

## Dependencies

- An email sending module (configured separately).
- Access to the task database.

## Setup

1. Install dependencies:
   ```bash
   npm install
