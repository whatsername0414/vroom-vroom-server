export const joinRoom = async (req, res) => {
    const { room } = req.params
    try {
        
        io.emit("new_task", { message: "" })
        
        res.status(200).json({data: { message: "Join successfull" }})
    } catch (error) {
        throw new Error(error)
    }
}