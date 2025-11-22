import React, { useContext, useEffect, useState } from 'react'
import {useUserAuth} from '../../hooks/useUserAuth'
import { UserContext } from '../../context/userContext'
import DashboardLayout from '../../components/layout/DashboardLayout'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import moment from 'moment'
import InfoCard from '../../components/Cards/InfoCard'
import { IoMdCard } from 'react-icons/io'
import { addThousandsSeparator } from '../../utils/helper'
import { LuArrowRight } from 'react-icons/lu'
import TaskListTable from '../../components/TaskListTable'
import CustomPieChart from '../../components/Charts/CustomPieChart'
import CustomBarChart from '../../components/Charts/CustomBarChart'
const COLORS = ['#8B5CF6', '#06B6D4', '#84CC16'];


const Dashboard = () => {
  useUserAuth()

  const {user} =useContext(UserContext)

  const navigate = useNavigate();

  const [dashboardData,setDashboardData] = useState(null)
  const [pieChartData,setPieChartData] = useState([])
  const [barChartData,setBarChartData] = useState([])

  const prepareChartData = (data) =>{
    const taskDistribution = data?.charts.taskDistribution || {} //may couse error if data or charts is undefined
    const taskPriorityLevels = data?.charts.taskPriorityLevel || {}
   console.log(taskPriorityLevels)
    const taskDistributionData = [
      {status: 'Completed', count: taskDistribution.Completed || 0},
      {status: 'In Progress', count: taskDistribution.InProgress || 0},
      {status: 'Pending', count: taskDistribution.Pending || 0},
    ]

    setPieChartData(taskDistributionData)
   
    const PriorityLevelData = [
      {priority: 'High', count: taskPriorityLevels.High || 0},
      {priority: 'Medium', count: taskPriorityLevels.Medium || 0},
      {priority: 'Low', count: taskPriorityLevels.Low || 0},
    ]
    

    setBarChartData(PriorityLevelData)
  }

  const getDashboardData = async () =>{
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_DASHBOARD_DATA)

      if(response.data){
        setDashboardData(response.data.data)
        prepareChartData(response.data.data || null)
        console.log("Dashboard Data:",response.data.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data",error);
    }
  }

  const onseeMore = ( ) =>{
    navigate('/admin/tasks')
  }

  useEffect(()=>{
    getDashboardData()

  return () => {};
  },[])  

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className='card my-5'> 
          <div>
            <div className='col-span-3'>
              <h2 className='text-xl md:text-2xl'>Welcome back, {user?.name}!</h2>
              <p className='text-xs md:text-[13px] text-gray-400 mt-1.5'>{moment().format("dddd Do MMM YYYY")}</p>
            </div>
          </div>

           <div className='grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-6 mt-5'>
               <InfoCard 
                label="Total Tasks"
                value={addThousandsSeparator(dashboardData?.charts?.taskDistribution?.All || 0)}
                color="bg-primary"
               />

               <InfoCard 
                label="Pending Tasks"
                value={addThousandsSeparator(dashboardData?.charts?.taskDistribution?.Pending || 0)}
                color="bg-violet-500"
               />

              <InfoCard 
                label="InProgress Tasks"
                value={addThousandsSeparator(dashboardData?.charts?.taskDistribution?.InProgress || 0)}
                color="bg-cyan-500"
              />

              <InfoCard 
                label="Completed Tasks"
                value={addThousandsSeparator(dashboardData?.charts?.taskDistribution?.Completed || 0)}
                color="bg-lime-500"
               />
          </div>
      </div>

      <div className='grid  grid-cols-1 md:grid-cols-2 gap-6 my-4 md:my-6'>
        
        <div>
            <div className='card'>
              <div className='flex items-center justify-between'>
                <h5 className='font-medium'>Task Distribution</h5>
              </div>

              <CustomPieChart
               data={pieChartData} 
               label="Total Balance"
               colors={COLORS}
              />
            </div>
        </div>

        <div>
            <div className='card'>
              <div className='flex items-center justify-between'>
                <h5 className='font-medium'>Task Priority Levels</h5>
              </div>

              <CustomBarChart
               data={barChartData} 
              />
            </div>
        </div>

        <div className='md:col-span-2'>
           <div className='card'>
             <div className='flex items-center justify-between'>
               <h5 className='text-lg'>Recent Tasks</h5>

               <button className='card-btn' onClick={onseeMore}>
                  See All <LuArrowRight className='text-base'/>
               </button>
             </div>

             <TaskListTable tableData={dashboardData?.recentTasks || []}/>
           </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
