# node-ip
A node based editor for image processing with layers

A simple to use node-editor for image processing made using WebCanvasAPI and Vanilla JS, no libraries... !
Some nodes can process images as well as individual color channels.

Types of Nodes (as of now):

* ImageSource     - (loads images and channels)
* Layer           - (can blend different channels or images or output from other nodes)
* CombineChannel  - (combines channels into image)
* Brightness      - (brightens image/channels)
* Contrast        - (adjust image/channels contrast)
* Gamma           - (adjust image/channels gamma)
* GrayScale       - (convert 3 channel rgb to 1 channel grayscale)
* Binarize        - (binarizes image)
* Reduce Palette  - (reduces color info on image)


See it in action [here](https://image-node.herokuapp.com/)

![Show1](/images/show1.png)
![Show2](/images/show2.png)
