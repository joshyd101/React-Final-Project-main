import React, { useEffect , useState } from 'react'
import axios from "axios";
import Swal from 'sweetalert2'
import Error from "../components/Error";
import Loader from "../components/Loader";
import Success from '../components/Success'
import StripeCheckout from 'react-stripe-checkout'

import moment from "moment"
import AOS from 'aos';
import 'aos/dist/aos.css';
AOS.init();
AOS.refresh()
function Bookingscreen({match}) {
    const[loading, setloading]=useState(true);
    const[error, seterror]=useState(false)
    const[success, setsuccess]=useState(false)   
    const[room , setroom]=useState()
    const roomid=match.params.roomid
    const fromdate=moment(match.params.fromdate , 'DD-MM-YYYY')
    const todate=moment(match.params.todate,'DD-MM-YYYY')
    const totalDays = moment.duration(todate.diff(fromdate)).asDays()+1
    const [totalAmount , settotalAmount]=useState()
    let amountCharge = 0;
  
    function amountSurcharge(){
        var d1 = new Date(fromdate);
        var d2 = new Date(todate);
        var isWeekend = false;
        var amountCharge=0;
        while (d1 < d2){
            var day = d1.getDay();
            isWeekend = (day === 6) || (day === 0);
            if (isWeekend) amountCharge++;
            d1.setDate(d1.getDate()+1);
        }
        return amountCharge;
    }
    amountCharge = amountSurcharge(amountCharge);
    console.log(amountCharge);
    useEffect(async() => {
        
        try {
            setloading(true);
            const data = await (await axios.post("/api/rooms/getroombyid" , {roomid})).data;
            console.log(data);
            setroom(data);
            setloading(false);
            settotalAmount( (amountCharge === 0)? data.rentperday * totalDays : data.rentperday*totalDays+ data.rentperday*data.surcharge*amountCharge/100)
          } catch (error) {
            console.log(error);
            setloading(false);
          }
          
    }, [])



    async function tokenHander(token) {
    
        console.log(token);
        const bookingDetails ={

            token ,
            user : JSON.parse(localStorage.getItem('currentUser')),
            room ,
            fromdate,
            todate,
            totalDays,
            totalAmount

        }


        try {
            setloading(true);
            const result = await axios.post('/api/bookings/bookroom' , bookingDetails)
            setloading(false)
            Swal.fire('Congrats' , 'Your Room has booked succeessfully' , 'success').then(result=>{
                window.location.href='/profile'
            })
        } catch (error) {
            console.log(error);
            setloading(false)
            Swal.fire('Oops' , 'Something went wrong , please try later' , 'error')
        }
        
    }

    return (
        <div className='m-5'>
            
            {loading ? (<Loader/>) : error ? (<Error/>) : (

                <div className="row p-3 mb-5 bs" data-aos='flip-right' duration='2000'>

                      <div className="col-md-6 my-auto">
                        
                         <div>
                         <h1> {room.name}</h1>
                           <img src={room.imageurls[0]} style={{height:'400px'}} />
                         </div>

                      </div>
                      <div className="col-md-6 text-right" data-aos='zoom-out'>
                           <div>
                           <h1><b>Booking Details</b></h1>
                           <hr />

                           <p><b>Name</b> : {JSON.parse(localStorage.getItem('currentUser')).name}</p>
                           <p><b>From Date</b> : {match.params.fromdate}</p>
                           <p><b>To Date</b> : {match.params.todate}</p>
                           <p><b>Number of Rooms </b>: {room.maxcount}</p>
                           <p><b>Surcharge </b>: {room.surcharge}%</p>
                           </div>
                           
                           <div className='mt-5'>
                           <h1><b>Amount</b></h1>
                           <hr />
                           <p>Total Days : <b>{totalDays}</b></p>
                           <p>Rent Per Day : <b>{room.rentperday}</b></p>
                           <h1><b>Total Amount : {totalAmount}</b></h1>

                           <StripeCheckout
            amount={totalAmount*100}
            shippingAddress
            token={tokenHander}
            stripeKey='pk_test_51JzPLAC5s4FHwtTAfooOlab0SSxrFOfzN47nq4PKBn1ORLst1ussV90ON4SOyerR8gL0MArodn2K4DfL4ntubhc400pYA2ZVhy'
            currency='USD'
            >

                  
                  <button className='btn btn-primary'>Pay Now</button>

            </StripeCheckout>
                           </div>
                          

                           
                      </div>

                </div>

            )}
        
        </div>
    )
}

export default Bookingscreen