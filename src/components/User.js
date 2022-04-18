import React, { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { Card, Icon, Modal } from "web3uikit";

function User({ account }) {
  const [isVisible, setIsVisible] = useState(false);
  const [userRentals, setUserRentals] = useState([]);
  const { Moralis } = useMoralis();

  useEffect(() => {
    const fetchRentalsList = async () => {
      await Moralis.start({
        appId: "xxx",
        serverUrl: "xxx"
      });
      const Rentals = Moralis.Object.extend("newBookings");
      const query = new Moralis.Query(Rentals);
      query.equalTo("booker", account);

      const result = await query.find();

      setUserRentals(result);
    }

    fetchRentalsList();
  }, [isVisible]);

  return (
    <>
      <div
        onClick={() => {
          setIsVisible(true);
        }}
      >
        <Icon
          fill="#000000"
          size={24}
          svg="user"
        />
      </div>

      <Modal
        onCloseButtonPressed={() => {
          setIsVisible(false);
        }}
        hasFooter={false}
        title="Your Stays"
        isVisible={isVisible}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "start",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          {
            userRentals && (
              userRentals.map((userRental) => {
                return (
                  <div style={{ width: "200px" }}>
                    <Card
                      isDisabled
                      title={userRental.attributes.city}
                      description={`${userRental.attributes.datesBooked[0]} for ${userRental.attributes.datesBooked.length} Days`}
                    >
                      <div>
                        <img
                          width="180px"
                          src={userRental.attributes.imgUrl} />
                      </div>
                    </Card>
                  </div>
                )
              })
            )
          }
        </div>
      </Modal>
      {/* <div>User</div> */}
    </>
  );
}

export default User;
