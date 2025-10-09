import server from "./server.js"
import colors from "colors"
const port = process.env.PORT || 3000

server.listen(port, () => {
    console.log(colors.bgGreen.bold(`Server is running on http://localhost:${port}`))
})