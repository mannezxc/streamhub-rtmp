import * as chalk from "chalk"

export const logMediaServer = (...args: string[]) => {
    console.log(chalk.bold.green("[INFO]"), chalk.bold.black("[NodeMediaServer prePublish]"))
}

export const log = {
    media: (...args: string[]) => console.log(chalk.bold.green("[INFO]"), chalk.bold.black("[NodeMediaServer prePublish]", ...args)),
    mediaError: (...args: string[]) => console.log(chalk.bold.green("[INFO]"), chalk.bold.red("[NodeMediaServer prePublish]", ...args)),
    userError: (...args: string[]) => console.log(chalk.bold.green("[ERROR]"), chalk.bold.red("[USER]", ...args)),
    info: (...args: string[]) => console.log(chalk.bold.green("[INFO]"), ...args),
}