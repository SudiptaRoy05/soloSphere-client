import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import { compareAsc, format } from "date-fns";
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useNavigate, useParams } from 'react-router-dom'
import { AuthContext } from '../providers/AuthProvider';
import toast from 'react-hot-toast';

const JobDetails = () => {
  const [startDate, setStartDate] = useState(new Date())
  const [job, setJob] = useState({});
  const { id } = useParams()
  const navigate = useNavigate();

  const { user } = useContext(AuthContext);


  console.log(job)

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchAll = async () => {
    const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/job/${id}`);
    setJob(data)
  }


  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target)

    const price = form.get('price');
    const comment = form.get('comment');
    const email = user?.email;
    const date = startDate;
    const jobId = job?._id;
    const title = job?.title;
    const category = job?.category;
    const status = "Pending";
    const buyer = job?.buyer?.email;

    // bid Permission validation 
    if (user?.email === job?.buyer?.email) {
      return toast.error('Acction not permitted');
    }

    console.log(compareAsc(new Date(job.deadline), new Date(date)))
    // time validation 
    if (compareAsc(new Date(), new Date(job.deadline)) === 1) {
      return toast.error('Deadline Over, Bidding forbidden')
    }

    // price validation 
    if (price > job.max_price) {
      return toast.error('Offer less or atleast equal to maximum price')
    }

    if (compareAsc(new Date(date), new Date(job.deadline)) === 1) {
      return toast.error('Offer a date within deadline');
    }


    const bidData = { price, comment, email, date, jobId, title, category, status, buyer }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/add-bids`, bidData)
      toast.success('Successfully bidded');
      e.target.reset();
      navigate('/my-bids');
    }
    catch (err) {
      console.log(err)
      toast.error(err?.response?.data);
    }


  }



  return (
    <div className='flex flex-col md:flex-row justify-around gap-5  items-center min-h-[calc(100vh-306px)] md:max-w-screen-xl mx-auto '>
      {/* Job Details */}
      <div className='flex-1  px-4 py-7 bg-white rounded-md shadow-md md:min-h-[350px]'>
        <div className='flex items-center justify-between'>
          <span className='text-sm font-light text-gray-800 '>
            Deadline: {job.deadline ? format(new Date(job.deadline), 'P') : "No Deadline"}
          </span>
          <span className='px-4 py-1 text-xs text-blue-800 uppercase bg-blue-200 rounded-full '>
            {job.category}
          </span>
        </div>

        <div>
          <h1 className='mt-2 text-3xl font-semibold text-gray-800 '>
            {job.title}
          </h1>

          <p className='mt-2 text-lg text-gray-600 '>
            {job.description}
          </p>
          <p className='mt-6 text-sm font-bold text-gray-600 '>
            Buyer Details:
          </p>
          <div className='flex items-center gap-5'>
            <div>
              <p className='mt-2 text-sm  text-gray-600 '>
                Name: {job?.buyer?.name}
              </p>
              <p className='mt-2 text-sm  text-gray-600 '>
                Email: {job?.buyer?.email}
              </p>
            </div>
            <div className='rounded-full object-cover overflow-hidden w-14 h-14'>
              <img
                referrerPolicy='no-referrer'
                src={job?.buyer?.photo}
                alt=''
              />
            </div>
          </div>
          <p className='mt-6 text-lg font-bold text-gray-600 '>
            Range: ${job.min_price} - ${job.max_price}
          </p>
        </div>
      </div>
      {/* Place A Bid Form */}
      <section className='p-6 w-full  bg-white rounded-md shadow-md flex-1 md:min-h-[350px]'>
        <h2 className='text-lg font-semibold text-gray-700 capitalize '>
          Place A Bid
        </h2>

        <form onSubmit={handleSubmit}>
          <div className='grid grid-cols-1 gap-6 mt-4 sm:grid-cols-2'>
            <div>
              <label className='text-gray-700 ' htmlFor='price'>
                Price
              </label>
              <input
                id='price'
                type='text'
                name='price'
                required
                className='block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md   focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40  focus:outline-none focus:ring'
              />
            </div>

            <div>
              <label className='text-gray-700 ' htmlFor='emailAddress'>
                Email Address
              </label>
              <input
                id='emailAddress'
                type='email'
                name='email'
                defaultValue={user?.email}
                readOnly
                className='block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md   focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40  focus:outline-none focus:ring'
              />
            </div>

            <div>
              <label className='text-gray-700 ' htmlFor='comment'>
                Comment
              </label>
              <input
                id='comment'
                name='comment'
                type='text'
                className='block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-200 rounded-md   focus:border-blue-400 focus:ring-blue-300 focus:ring-opacity-40  focus:outline-none focus:ring'
              />
            </div>
            <div className='flex flex-col gap-2 '>
              <label className='text-gray-700'>Deadline</label>

              {/* Date Picker Input Field */}
              <DatePicker
                className='border p-2 rounded-md'
                selected={startDate}
                onChange={date => setStartDate(date)}
              />

            </div>
          </div>

          <div className='flex justify-end mt-6'>
            <button
              type='submit'
              className='px-8 py-2.5 leading-5 text-white transition-colors duration-300 transform bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:bg-gray-600'
            >
              Place Bid
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default JobDetails
