import { useState, useRef, useEffect } from "react"
import axios from 'axios';
import { withSwalInstance } from 'sweetalert2-react';
import swal from 'sweetalert2';
import Chart from 'react-apexcharts';
import { Audio } from 'react-loader-spinner';

;<Audio
  height="80"
  width="80"
  radius="9"
  color="green"
  ariaLabel="loading"
  wrapperStyle
  wrapperClass
/>
 

const SweetAlert = withSwalInstance(swal);

export function Body_Content(){

    const [data, setData] = useState();
    const [image, setImage] = useState([]);
    const [isDragging, setDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState();
    const fileInput = useRef(null);

    const [graphData, setGraphData] = useState({ labels: [], counts: [] });
    const [category, setcategory] = useState(["First:", "Second", "Third"]);

    const [drawGraph, setDrawGraph] = useState(false);

    let confidence = 0;
    let message = "Not Available...";
    let className = "Not Available...";
    let price = [];
    let multi = [];
    let counter = [];

    //Send_Product_Message inputs:
    const [productName, setName] = useState();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);

        setTimeout(() => {
          setLoading(false);
        }, 2000);

      }, []);

    const Select_Files = () => {
        fileInput.current.click();
    }

    const onFileSelect = ((e) => {
        const files = e.target.files;
        if (!files || files.length === 0) {
            setSelectedFile(undefined);
            setImage(false);
            setData(undefined);
            return;
        }

        setSelectedFile(files[0]);
        setData(undefined);

        for (let x = 0; x < files.length; x++) {
            if (files[x].type.split('/')[0] !== 'image') continue;
            if(!image.some((e) => e.name === files[x].name)){
                setImage((prevImages) => [
                    ...prevImages,
                    {
                        name: files[x].name,
                        url: URL.createObjectURL(files[x])
                    }
                ])
            }
            
        }
    })

    const Delete_Image = (index)=>{
        setImage((prevImages) => 
            prevImages.filter((_, i) => i !== index)
        )
        
        confidence = 0;
        className = "";
        message = "";

        window.location.reload();
    }

    const onDragOver = (e) => {
        e.preventDefault();
        setDragging(true);
        e.dataTransfer.dropEffect = "copy";
    }
    const onDragLeave = (e) => {
        e.preventDefault();
        setDragging(false);
    }
    const onDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        const files = e.dataTransfer.files;
        setSelectedFile(files[0]);

        for (let x = 0; x < files.length; x++) {
            if (files[x].type.split('/')[0] !== 'image') continue;
            if(!image.some((e) => e.name === files[x].name)){
                setImage((prevImages) => [
                    ...prevImages,
                    {
                        name: files[x].name,
                        url: URL.createObjectURL(files[x])
                    }
                ])
            }
            
        }
    }

    const UploadImage = async ()=> {
        
        if (image.length !== 0) {
            let formData = new FormData();
            formData.append("file", selectedFile);
            let res = await axios({
              method: "post",
              url: process.env.REACT_APP_API_URL,
              data: formData,
            });
            if (res.status === 200) {
                setData(res.data);
            }
        }else{

            swal.fire("Error", "Please make sure a picture is uploaded!", "error")
        }
    }

    const display_Messg = (x) =>{

        if (x === "N/A") {
            document.querySelector("#messages").innerHTML ="";
            
            document.querySelector("#messages").innerHTML = `
    
                <div class="alert alert-warning alert-dismissible fade show" role="alert">
                    <span type="button" class="close" data-bs-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </span><br>
                    <form action="#" method="POST">
                        <p>If this product is valuable, Click button below and provide us with the name of that product so that we can Update our AI model,THANK YOU!</p>
                        <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModalCenter">
                        Click Me
                        </button>
                    </form>
                </div>
            `

        }

    }

    if (data) {

        className = data.class;
        confidence = (parseFloat(data.confidence));
        message = data.message;

        display_Messg(className, confidence, message);
    }

    const Send_Product_Message = async ()=>{
        
        if (!productName) {
            swal.fire('Error',"Please make sure all inputs are filled!", "error");
        }else{

            let formData = new FormData();
            formData.append("product", productName);
            formData.append("image", selectedFile);

            let results = await fetch("http://localhost:8000/send_email", {
              method: "post",
              body: formData,
            })

            if (results.status === 200) {
                swal.fire('Success', "Email sent successfully!", "success"); 
            }
            
            //swal.fire('Error', "Something went wrong! We apologise for inconvenience!", "error");
        }
        
    }

    const Generate_Graph = async ()=>{
       if (selectedFile) {
          
           fetch("http://localhost:8000/display_counts")
            .then(x => { return x.json() })
            .then(product_data => {
                if (product_data) {
                    setGraphData({ labels: product_data.Labels, counts: product_data.Counts });

                    product_data.multiplier_counts.forEach((x, i) => {
                        counter.push([x.Count]);
                        price.push([x.Price]);
                        multi.push([x.Multiplier]);
                    });

                    //COUNTER VALUES
                    let chtml ="";
                    counter.forEach(c => {
                        chtml+= `<p>${c}</p>`
                        
                    });
                    document.querySelector('.count-values').innerHTML= chtml

                    //MULTIPLIER VALUES
                    let mhtml ="";
                    multi.forEach(m => {
                        mhtml+= `<p>${m}</p>`
                        
                    });
                    document.querySelector('.multi-values').innerHTML= mhtml

                    //PRICE VALUES
                    let phtml ="";
                    price.forEach(p => {
                        phtml+= `<p>R${p}</p>`
                        
                    });
                    document.querySelector('.price-values').innerHTML= phtml


                    //CATEGORY LABELS
                    let cattml ="";
                    category.forEach(cat => {
                        cattml+= `<p>${cat}</p>`
                        
                    });
                    document.querySelector('.cate-values').innerHTML= cattml;

                }
            })
            
        }else{

            swal.fire("Error", "Make sure you have uploaded at least 1 product before generating a graph!", "error");
        }
        
    }

    const handleDrawGraph = () => {
        setDrawGraph(true);
      };

    return(

        <div id="mid">

            <div>

                <div class="modal fade" id="exampleModalCenter" tabindex="-1" role="dialog" aria-bs-labelledby="exampleModalCenterTitle" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered" role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="exampleModalLongTitle">Send Message</h5>
                                <button type="button" class="close" data-bs-dismiss="modal" aria-bs-label="Close">
                                <span aria-bs-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div class="modal-body">
                                <input className="product_name" type="text" onChange={(e)=>setName(e.target.value)} placeholder="Product name..."/><br></br>
                                <textarea className="product_mssg"disabled value={message}></textarea>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                <button type="button" onClick={Send_Product_Message} class="btn btn-primary">Submit</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

           <div className="left-side">
                <section className="card">
                        <div className="top">
                            <p>Drag & Drop image here</p>
                            <strong></strong>
                        </div>
                        <span className="select" role="button" onClick={Select_Files}>
                            <div className="drag-area" onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
                                {isDragging ? (

                                    <span className="select">Drop images here</span>

                                    ) : (
                                        <>
                                        
                                        Drag & Drop image here...
                                        {/* <span className="select" role="button" onClick={Select_Files}>
                                            Browse
                                        </span> */}

                                        </>
                                    )
                                }
                                
                                <input name="file" type="file" className="file" ref={fileInput} onChange={onFileSelect}/>
                            </div>
                        </span>
                        <div className="container">
                            {image.map((images, index) => (

                                <div className="images" key={index}>
                                    <span
                                     onClick={() => Delete_Image(index)}>&times;</span>

                                    <img src={images.url} alt={images.name}/>
                                </div>
                            ))}
                        </div>
                        <button type="button" className="upload" onClick={UploadImage}>Upload</button>
                        <button className="btn btn-finish btn-success" onClick= {Generate_Graph}>Click me if complited</button>
                        
                </section >

                <section id="messages">
                    <h2>Welcome to <br></br> Fruit & Vegitable web page</h2>
                </section>
               
           </div>
        
            <div className="right-side">

                <div className="container-box">
                    <div className="row">
                        <div className="col-md-4 blue">
                            <span>Category:</span>
                            <div>

                            <p className="class_Name">{className}</p>
                            </div>
                        </div>
                        <div className="col-md-4 green">
                            <span>Confidence:</span>
                            <div>

                            <p className="confidence">{confidence}%</p>
                            </div>
                        </div>
                        <div className="col-md-4 red">
                            <span>Message:</span>
                            <div>

                            <p className="mssg">{message}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <section className="multiplier">

                <div className="alert count-price alert-success alert-dismissible fade show" role="alert">
                    <span type="button" className="close" data-bs-dismiss="alert" aria-label="Close">
                        {/* <span aria-hidden="true">&times;</span> */}
                    </span>
                    {/* <div className="col">
                        <div className="tittle">
                            <strong>Category:</strong>
                        </div>
                        <div className="cate-values"></div>
                    </div>
                    <div className="col">
                        <div className="tittle">
                            <strong>Price per Class:</strong>
                        </div>
                        <div className="multi-values"></div>
                    </div>

                    <div className="col">
                        <div className="tittle">
                            <strong>Number of Classes:</strong>
                        </div>
                        <div className="count-values"></div>
                    </div>

                    <div className="col">
                        <div className="tittle">
                            <strong>Total Price:</strong>
                        </div>
                        <div className="price-values"></div>
                    </div> */}


                    <table class="table table-striped table-bordered">
                        <thead>
                            <tr>
                                <th>Class:</th>
                                <th>(R)/ Class:</th>
                                <th>Num Classes:</th>
                                <th>Total(R):</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="cate-values"></td>
                                <td className="multi-values"></td>
                                <td className="count-values"></td>
                                <td className="price-values"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                </section>

                <div className="image-bg">
                    <div className="blank"></div>
                    <img src="/Images/food-rainbow-vegetable-fruit-variety-group-healthy-1296x728-header.webp" alt="Mix Fruits and Vegitable"/>
                    

                <Chart
                    type="bar"
                    width={950}
                    height={350}

                    series={[
                        {
                            name: "Fruit & Vegetable classification.",
                            data: graphData.counts
                        }
                    ]}

                    options={
                        {
                            title: {
                                text: "Class Counts",
                                style: { fontSize: 15 }
                            },

                            color: ['#000'],
                            theme: { mode: 'dark' },
                            xaxis: {
                                tickPlacement: 'on',
                                categories: graphData.labels,
                                title: {
                                    text: "Fruit & Veg Bar Graph",
                                    style: { color: "#009688", fontSize: 15 }
                                }
                            },

                            yaxis: {
                                labels: {
                                    formatter: (val) => { return `${val}` },
                                    style: {
                                        fontSize: 10,
                                        colors: ['#f90000']
                                    }
                                },

                                title: {
                                    text: "Counts",
                                    style: {
                                        fontSize: 12,
                                        colors: ['#009688']
                                    }
                                }
                            },

                            legend: {
                                show: true,
                                position: 'right'
                            },

                            dataLabels: {
                                formatter: (v) => { return `${v}` },
                                style: {
                                    fontSize: 10,
                                    colors: ['#000']
                                }
                            }
                        }
                    }
                >

                </Chart>

                </div>

            </div>
            
        </div>

    )
}