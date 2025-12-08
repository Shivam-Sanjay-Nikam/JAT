
import { useContext } from 'react'
import { NotificationContext } from '../context/NotificationProvider'

export const useNotifications = () => {
    return useContext(NotificationContext)
}
