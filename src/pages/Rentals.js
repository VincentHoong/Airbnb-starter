import React, { useState, useEffect } from "react";
import "./Rentals.css";
import { Link, useLocation } from "react-router-dom";
import logo from "../images/airbnbRed.png";
import { Button, ConnectButton, Icon, useNotification } from "web3uikit";
import RentalsMap from "../components/RentalsMap";
import User from "../components/User";
import { useMoralis, useWeb3ExecuteFunction } from "react-moralis";
import AirbnbABI from "../abi.json";

const Rentals = () => {
  const { Moralis, account } = useMoralis();
  const { state: searchFilters } = useLocation();
  const [highlight, setHighlight] = useState();
  const [rentalsList, setRentalsList] = useState([]);
  const [coordinates, setCoordinates] = useState([]);
  const contractProcessor = useWeb3ExecuteFunction();
  const dispatch = useNotification();
  // const rentalsList = [
  //   {
  //     attributes: {
  //       city: "New York",
  //       unoDescription: "3 Guests • 2 Beds • 2 Rooms",
  //       dosDescription: "Wifi • Kitchen • Living Area",
  //       imgUrl:
  //         "https://ipfs.moralis.io:2053/ipfs/QmS3gdXVcjM72JSGH82ZEvu4D7nS6sYhbi5YyCw8u8z4pE/media/3",
  //       lat: "40.716862",
  //       long: "-73.999005",
  //       name: "Apartment in China Town",
  //       pricePerDay: "3",
  //     },
  //   },
  // ];

  const handleSuccess = () => {
    dispatch({
      type: "success",
      message: `Nice! You are going to ${searchFilters.destination}`,
      title: "Booking Successful",
      position: "topL",
    });
  };

  const handleError = (message) => {
    dispatch({
      type: "error",
      message: `${message}`,
      title: "Booking Failed",
      position: "topL",
    });
  }

  const handleNoAccount = () => {
    dispatch({
      type: "error",
      message: "You need to connect to your wallet to book a rental",
      title: "Not Connected",
      position: "topL",
    });
  }

  useEffect(() => {
    const fetchRentalsList = async () => {
      await Moralis.start({
        appId: "h7vkV39O7ZfRp7EiF1HWUVdc1Dk5pm5N0jYzRjAc",
        serverUrl: "https://gwrgguyxjoug.usemoralis.com:2053/server"
      });
      const Rentals = Moralis.Object.extend("Rentals");
      const query = new Moralis.Query(Rentals);
      query.equalTo("city", searchFilters.destination);
      query.greaterThanOrEqualTo("maxGuests_decimal", searchFilters.guests);

      const result = await query.find();

      setRentalsList(result);
      const coordinates = result.map((rentalList) => {
        return {
          lat: rentalList.attributes.lat,
          lng: rentalList.attributes.long
        }
      });
      setCoordinates(coordinates);
    }

    fetchRentalsList();
  }, [searchFilters]);

  const bookRental = async (start, end, id, dayPrice) => {
    let array = [];
    for (let dt = new Date(start); dt < end; dt.setDate(dt.getDate() + 1)) {
      array.push(new Date(dt).toISOString().slice(0, 10));
    }
    const options = {
      contractAddress: "0x2A9Ce04dD2dB1eE211a8030EA5E20236DD839c21",
      functionName: "addDatesBooked",
      abi: AirbnbABI,
      params: {
        id: id,
        newBookings: array
      },
      msgValue: Moralis.Units.ETH(dayPrice * array.length),
    };

    await contractProcessor.fetch({
      params: options,
      onSuccess: () => {
        handleSuccess()
      },
      onError: (error) => {
        handleError(error);
      }
    });
  }

  return (
    <>
      <div className="topBanner">
        <div>
          <Link to="/">
            <img className="logo" src={logo} alt="logo" />
          </Link>
        </div>
        <div className="searchReminder">
          <div className="filter">
            {searchFilters.destination}
          </div>
          <div className="vl" />
          <div className="filter">
            {`
              ${searchFilters.checkIn.toLocaleString("default", { month: "short" })}
              ${searchFilters.checkIn.toLocaleString("default", { day: "2-digit" })}
              -
              ${searchFilters.checkOut.toLocaleString("default", { month: "short" })}
              ${searchFilters.checkOut.toLocaleString("default", { day: "2-digit" })}
            `}
          </div>
          <div className="vl" />
          <div className="filter">
            {searchFilters.guests} Guests
          </div>
          <div className="searchFiltersIcon">
            <Icon fill="#ffffff" size={20} svg="search" />
          </div>
        </div>
        <div className="lrContainers">
          {
            account && (
              <User account={account} />
            )
          }
          <ConnectButton />
        </div>
      </div>
      <hr className="line" />
      <div className="rentalsContent">
        <div className="rentalsContentL">
          Stays Available for Destination
          {
            rentalsList && (
              rentalsList.map((rentalList, rentalListKey) => {
                return (
                  <>
                    <hr className="line2" />
                    <div className={rentalListKey === highlight ? "rentalDivH" : "rentalDiv"}>
                      <img className="rentalImg" src={rentalList.attributes.imgUrl} />
                      <div className="rentalInfo">
                        <div className="rentalTitle">
                          {rentalList.attributes.name}
                        </div>
                        <div className="rentalDesc">
                          {rentalList.attributes.unoDescription}
                        </div>
                        <div className="rentalDesc">
                          {rentalList.attributes.dosDescription}
                        </div>
                        <div className="bottomButton">
                          <Button
                            text="Stay Here"
                            onClick={() => {
                              if (account) {
                                bookRental(
                                  searchFilters.checkIn,
                                  searchFilters.checkOut,
                                  rentalList.attributes.uid,
                                  Number(rentalList.attributes.pricePerDay)
                                );
                              } else {
                                handleNoAccount();
                              }
                            }}
                          />
                          <div className="price">
                            <Icon fill="#808080" size={10} svg="eth" />
                            {rentalList.attributes.pricePerDay} / Day
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )
              })
            )
          }
        </div>
        <div className="rentalsContentR">
          <RentalsMap locations={coordinates} setHighlight={setHighlight} />
        </div>
      </div>

      {/* <Link to="/"> Home </Link> */}
    </>
  );
};

export default Rentals;
