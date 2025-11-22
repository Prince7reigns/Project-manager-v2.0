import React,{useState,useEffect} from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { LuFileSpreadsheet } from 'react-icons/lu';
import TaskCard from '../../components/Cards/TaskCard'
import TaskStatusTabs from "../../components/TaskStatusTabs"
import toast from 'react-hot-toast'


const MyTasks = () => {

  const [allTasks,setAllTasks]= useState([])

  const [tabs,setTabs] = useState([])

  const[filterStatus,setFilterStatus] = useState("All")

  const navigate = useNavigate()

  const getAllTasks = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS,{
        params:{
          status:filterStatus === "All" ? "" :filterStatus
        }
      })

      setAllTasks(response.data.data.tasks?.length  >  0 ? response.data.data.tasks : [])

      const summary = response.data?.data.summary || {}

      console.log(response.data?.data)

      const statusArray = [
        {label:"All",count: summary.all || 0},
        {label:"Pending" , count:summary.pending || 0},
        {label:"In Progress", count:summary.inProgress || 0},
        {label:"Completed", count:summary.completed || 0},
      ]
      setTabs(statusArray)
    } catch (error) {
      console.error("error fetching users",error)
    }
  }

  const handelClick = (taskId) =>{
    navigate(`/user/tasks-details/${taskId}`)
  }


  useEffect(()=>{
    getAllTasks(filterStatus)
    return ()=> {}
  },[filterStatus])

  return (
    <DashboardLayout  activeMenu="My Tasks">
      <div className="my-5">
         <div className='flex flex-col lg:flex-row lg:items-center justify-between'>
              <h2 className='text-xl md:text-xl font-medium'>My Tasks</h2>

            {tabs?.[0]?.count > 0 && (
                  <TaskStatusTabs
                   tabs={tabs}
                   activeTab={filterStatus}
                   setActiveTab={setFilterStatus}
                  />
            )}
         </div>

          <div className='grid grid-cols-1  sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4'>
            {allTasks?.map((item,index)=>(
              <TaskCard
                key={item._id}
                title={item.title}
                description={item.description}
                priority={item.priority}
                status={item.status}
                progress={item.progress}
                createdAt={item.createdAt}
                dueDate={item.dueDate}
                assignedTo={item.assignedTo?.map((item) => item.profileImageUrl.url)}
                attachmentCount={item.attachments?.length || 0}
                completedTodoCount={item.completedTodoCount || 0}
                todoChecklist={item.todoChecklist || []}
                onClick={() => handelClick(item._id)}
              />
            ))}
          </div>
      </div>
    </DashboardLayout>
  )
}

export default MyTasks
