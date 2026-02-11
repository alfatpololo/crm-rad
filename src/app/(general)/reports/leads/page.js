import DuplicateLayout from '@/app/duplicateLayout'
import Footer from '@/components/shared/Footer'
import PageHeader from '@/components/shared/pageHeader/PageHeader'
import PageHeaderWidgets from '@/components/shared/pageHeader/PageHeaderWidgets'
import InquiryChannelChart from '@/components/widgetsCharts/InquiryChannelChart'
import InquiryTrackingChart from '@/components/widgetsCharts/InquiryTrackingChart'
import ProjectLeads from '@/components/widgetsList/ProjectLeads'
import ScheduleTwo from '@/components/widgetsList/ScheduleTwo'
import LeadsStatistics from '@/components/widgetsStatistics/LeadsStatistics'
import LeadsStatusTwo from '@/components/widgetsTables/LeadsStatusTwo'
import { upcomingEventsData } from '@/utils/fackData/upcomingEventsData'
import React from 'react'
import { serializeForClient } from '@/utils/serialization'

const page = () => {
    const safeUpcoming = serializeForClient(upcomingEventsData.slice(0, 3))
    return (
        <>
            <PageHeader >
                <PageHeaderWidgets />
            </PageHeader>
            <div className='main-content'>
                <div className='row'>
                    <LeadsStatistics />
                    <InquiryTrackingChart />
                    <InquiryChannelChart />
                    <LeadsStatusTwo />
                    <ScheduleTwo title={"Upcoming Events"} data={safeUpcoming} />
                    <ProjectLeads />
                </div>
            </div>
            <Footer />
        </>
    )
}

export default page