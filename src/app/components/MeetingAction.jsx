"use client"
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useSession } from 'next-auth/react'
import { Copy, Link2, LinkIcon, Plus, Video } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { v4 as uuidv4 } from 'uuid';
import Loader from './Loader'

const MeetingAction = () => {
  const [isLoading,setIsLoading] = useState()
  const [isDialogOpen,setIsDialogOpen] = useState(false)
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [baseUrl,setBaseUrl] = useState("")
  const router = useRouter()
  const [generatedMeetingUrl,setGeneratedMeetingUrl] = useState("")
  const [meetingLink,setMeetingLink] = useState("")
  const [scheduledAt, setScheduledAt] = useState("")
  const [recurrence, setRecurrence] = useState("none")
  const [weeklyDay, setWeeklyDay] = useState("1") // 1-5 => Mon-Fri
  const [weeklyTime, setWeeklyTime] = useState("")
  const { data: session } = useSession();

  useEffect(() =>{
    setBaseUrl(window.location.origin)
  },[])

  const createMeetingRecord = async ({ roomId, hostKey, kind, startAt, recurrence }) => {
    const hostUserId = session?.user?.id || "";
    const response = await fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roomId,
        hostKey,
        kind,
        startAt,
        recurrence,
        hostUserId,
        hostName: session?.user?.name || "",
      }),
    });
    if (!response.ok) throw new Error("create_meeting_failed");
  };

  const handleCreateMeetingForLater = async () =>{
    if (recurrence !== "weekly" && !scheduledAt) {
      toast.error("Please choose meeting date and time");
      return;
    }
    if (recurrence === "weekly" && (!weeklyDay || !weeklyTime)) {
      toast.error("Please choose weekly day and time");
      return;
    }

    const toNextWeekdayDateTimeISO = (dayIndex, timeValue) => {
      const now = new Date();
      const [h, m] = timeValue.split(":").map(Number);
      const target = new Date(now);
      target.setHours(h, m, 0, 0);
      // JS getDay(): Sun=0, Mon=1 ... Sat=6
      const currentDay = now.getDay();
      let delta = Number(dayIndex) - currentDay;
      if (delta < 0 || (delta === 0 && target <= now)) delta += 7;
      target.setDate(now.getDate() + delta);
      return target.toISOString();
    };

    const effectiveStartAt =
      recurrence === "weekly"
        ? toNextWeekdayDateTimeISO(weeklyDay, weeklyTime)
        : new Date(scheduledAt).toISOString();

    const roomId=  uuidv4();
    const hostKey = uuidv4();
    try {
      localStorage.setItem(`hostKey:${roomId}`, hostKey);
      await createMeetingRecord({
        roomId,
        hostKey,
        kind: "scheduled",
        startAt: effectiveStartAt,
        recurrence,
      });
    } catch {
      toast.error("Could not schedule meeting");
      return;
    }
    const url = `${baseUrl}/join/${roomId}?hostKey=${hostKey}`
    setGeneratedMeetingUrl(url)
    setIsDialogOpen(true);
    setIsScheduleDialogOpen(false);
    toast.success("meeting link created successfully")
  }

  const handleJoinMeeting = () =>{
    if(meetingLink){
      setIsLoading(true);
      const raw = meetingLink.trim();
      const formattedLink = raw.includes("http")
        ? raw
        : `${baseUrl}/join/${raw}`;
      const url = new URL(formattedLink, baseUrl);
      router.push(`${url.pathname}${url.search}`);
      toast.info('joining meeting...')
    }else {
      toast.error('please enter a valid link or code ')
    }
  }


  const handleStartMeeting = async () =>{
    setIsLoading(true);
     const roomId=  uuidv4();
    const hostKey = uuidv4();
    try {
      localStorage.setItem(`hostKey:${roomId}`, hostKey);
      await createMeetingRecord({
        roomId,
        hostKey,
        kind: "instant",
      });
    } catch {
      setIsLoading(false);
      toast.error("Could not start meeting");
      return;
    }
    const meetingUrl = `${baseUrl}/join/${roomId}?hostKey=${hostKey}`
    router.push(meetingUrl)
    toast.info('joining meeting...')
  }

  const copyToClipboard =() =>{
    navigator.clipboard.writeText(generatedMeetingUrl);
    toast.info('meeting link copied to clipboard')
  }
  return (
    <>
    {isLoading && <Loader/>}
    <div className='flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4'>
         <DropdownMenu>
          <DropdownMenuTrigger asChild>
              <Button className="w-full sm:w-auto" size="lg">
                <Video className='w-5 h-5 mr-2'/>
                New meeting
              </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setIsScheduleDialogOpen(true)}>
              <Link2 className='w-4 h-4 mr-2'/>
              create a meeting for later
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleStartMeeting} >
              <Plus className='w-4 h-4 mr-2'/>
              start an instant meeting 
            </DropdownMenuItem>
          </DropdownMenuContent>
         </DropdownMenu>
         <div className='flex w-full sm:w-auto relative'>
          <span className='absolute left-2 top-1/2 transform -translate-y-1/2'>
            <LinkIcon className='w-4 h-4 text-gray-400'/>
          </span>
           <Input
            placeholder='Enter a code or link'
            className="pl-8 rounded-r-none pr-10"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
          />
          <Button
           variant="secondary"
           className="rounded-l-none"
           onClick={handleJoinMeeting}
          >
            Join
          </Button>

         </div>
    </div>
    <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
      <DialogContent className="max-w-sm rounded-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Schedule meeting
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Select the date and time when participants can join automatically.
          </p>
          <Input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            disabled={recurrence === "weekly"}
          />
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Repeat</label>
            <select
              className="w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value)}
            >
              <option value="none">Does not repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          {recurrence === "weekly" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Day</label>
                <select
                  className="w-full rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
                  value={weeklyDay}
                  onChange={(e) => setWeeklyDay(e.target.value)}
                >
                  <option value="1">Monday</option>
                  <option value="2">Tuesday</option>
                  <option value="3">Wednesday</option>
                  <option value="4">Thursday</option>
                  <option value="5">Friday</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1 text-gray-700 dark:text-gray-300">Time</label>
                <Input
                  type="time"
                  value={weeklyTime}
                  onChange={(e) => setWeeklyTime(e.target.value)}
                />
              </div>
            </div>
          )}
          <Button className="w-full" onClick={handleCreateMeetingForLater}>
            Create scheduled link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="max-w-sm rounded-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-3xl font-normal">
              Here's your joining information
          </DialogTitle>
        </DialogHeader>
        <div className='flex flex-col space-y-4 '>
          <p className='text-sm text-gray-600 dark:text-gray-300'>
          Send this to people that you want to meet with. Make sure that you save it so that you can use it later, too.
          </p>
          <div className='flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-4 rounded-lg '>
             <span className='text-gray-700 dark:text-gray-200 break-all'>
                 {generatedMeetingUrl.slice(0,30)}...
             </span>
             <Button variant="ghost" className="hover:bg-gray-200" onClick={copyToClipboard}>
                 <Copy className='w-5 h-5 text-orange-500'/>
             </Button>
          </div>
        </div>
      </DialogContent>
         
    </Dialog>
    </>
  )
}

export default MeetingAction