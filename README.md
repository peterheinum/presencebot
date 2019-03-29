# Presencebot

A slackbot made to ease Axels workload with taking presence. 

## Getting Started

Type in 'startover:{googlesheetsid}' to get the bot started and configged with the id you choose

### Prerequisites
```
Slack
```
```
Presencebot existing in your workspace
```
## [How To Use](#usage)

## Available commands

| Command                | Privileges | Description                   |
| ---------------------- | ---------- | ----------------------------- |
| `närvaro`              | `Teacher`  | Starts a presencecheck        |
| `{randomcode}`         | `Student`  | Will give the user presence   |
| `sick`                 | `Student`  | For calling in sick           |
| `currentcell`          | `Teacher`  | Display next cell             |
| `datereset`            | `Teacher`  | Reset date in db              |
| `help`                 | `*`        | Show available commands       |
| `currentsheet`         | `Teacher`  | Show current excell sheet     |
| `sheet:{sheetID}`      | `Teacher`  | Change sheets to {sheetID}    |
| `jumpcell:{cell}`      | `Teacher`  | Change cell to {cell}         |
| `startover:{sheetid}`  | `Teacher`  | Empties db and changes sheet  |


## Built With

* [NodeJS](https://nodejs.org/en/) - Used for all the logic
* [MongoDB](https://www.mongodb.com/) - Used to store variables and counters
* [Google Sheets Api](https://developers.google.com/sheets/api/) - Used to store dates and people

## Contributing

Feel free to email me for suggestions at Peter.heinum@gmail.com

## Authors

***Peter Heinum** - *Master chef* - [github](https://github.com/peterheinum)

## Acknowledgments

* Recomended not to browse the sourcecode unless you are not afraid of headaches.
* inspirations
* Nothing better to do
* Waste of paper
* Jumpcell command is limited.
