import { Navigate } from "react-router-dom"

interface Props {
    children: React.ReactNode
}

function ProtectedRoute({
    children
}: Props) {

    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    )

    if (!user?.id) {
        return <Navigate to="/" replace />
    } else {
        const max = user.ttl
        const now = Date.now()
        const diff = max - now
        if(diff < 0){
            localStorage.removeItem("user")
            return <Navigate to="/" replace />
        }
    }

    return children
}

export default ProtectedRoute