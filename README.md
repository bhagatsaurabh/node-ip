<p align="center">
<a href="https://node-ip.saurabhagat.me">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/saurabh-prosoft/node-ip/main/app/assets/images/cover-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/saurabh-prosoft/node-ip/main/app/assets/images/cover-light.png">
  <img alt="Shows an illustrated sun in light mode and a moon with stars in dark mode." src="https://raw.githubusercontent.com/saurabh-prosoft/node-ip/main/app/assets/images/cover-light.png">
</picture>
</a>
</p>

<br/>

<h2>Node IP</h2>

<p align="center">
<a href="https://github.com/saurabh-prosoft/node-ip/actions/workflows/release.yml">
<img alt="GitHub Workflow Status" src="https://img.shields.io/github/actions/workflow/status/saurabh-prosoft/node-ip/release.yml?branch=main&label=Build%20%26%20Deploy&logo=data%3Aimage%2Fpng%3Bbase64%2CiVBORw0KGgoAAAANSUhEUgAAABAAAAAQEAYAAABPYyMiAAAABGdBTUEAALGPC%2FxhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAABmJLR0QAAAAAAAD5Q7t%2FAAAACXBIWXMAAABgAAAAYADwa0LPAAAAB3RJTUUH5gUKFyETutzc4wAABApJREFUSMedlH1M1WUUxz%2Fnd2HGVsyLeMk%2F2HRo%2BgerSeIE3eRNJoo01Li6xaw1UAspV7zNF0Rteq9by%2BlUslUiMzEvKPEiV2DpFJZbOcNcGBW5ZclVzIGIee%2Fv9Ede2rjdXev717Nn55zP95zn2RHGqazMtV21qYk2%2BQjS02nTU9DdbZi%2BPigq2jUlL0%2Fk2jX%2Bo8oW1TtVV63CrfGwezefyh%2BwZ4%2BMD6xIa5ipmpTkazF9cOaMVOKAyEiW4oGBAWOGz4rGx%2B%2BakmcXw%2BMJBnxLG1R14sSnEsxXUZeLTHKQtLSxgNucgP5%2Bo%2FQb14hqc3PFFtf7qvPn7%2BrM7RXp7qaATLSoaCyhmclgs%2Fm%2BCvsFVq8O1XF4%2FqPPwWqlHjuycGFAwA15ESoqDHmJLZCSYj7NILS2lpe74lULC6nmPCxbNj5PjukpJCYmGPjdV%2BqdatpshtNyFRobOcQDsFhok40wOoqbRrSz03F2eanI8eNheFmHdnUxyLdIRobCbKiulipA%2FoUwTXrBag0O1mGko0P28gLEx%2FMsL6OtrUaUzEDy88053iXg9XKZIwCG7pZRpLiYJj6AW7dCfyf9ENavL%2Fv5ZKPq1q2gqipiydSpcPq0H6x2sqClZWRmxPeQm%2Fv3096543Dm2cW4d29sov7DOwlfJKgZHW2Z%2FucpJC9P6ogFm00iCQerVd%2BgDoqLA%2Fys03CorDQ%2Blj7o6PDlMws2bHjQFzEdXbNm35Ilz4nx8GGwdoQnVLn95HU1S0p0qvQgTmfAXEpxwbZtzkkrjolUVT1p3ZAGSnc2rFVz7lzLQ3MmEh6u1zUbTU4OZsQ%2FEce0lTki27f%2FbwMl5%2BsnqSYkGHF6Fc6epVnS0AkTKPBdQ7Kz6TTeRBcswE06smNHQOFGKYf9%2BxnRGXD3rllAJzowYHnddwTq6vx7JMCAv2MZMksRt5tZHISbN3UpI%2BjFi%2FIJUYjdbgwTBVlZZgp9aGpqMCMB%2BmehRUFqqhEK7PUxgmZlSTuVSGwsg7wGpumbYPSijx450lccEGPnTi5wC%2FbtC2ng8UIzEyyz0b17jfIvXTfUTEwMBg4b4hAcPMgVhmHePH3GcKKZmc7NudViXLo0VvgC62FwMAD4q3wGtbXUyVy0sJAoLsPQEFWSA0lJhuYyDDU1lLMFIiMlw5eI5uSMgX%2FnByQ5OSj4sfQ9ItDbtwPuRW2o2%2B3oXx4rxuHD1OgxWLxY5%2BjXyLlzUtbjmqOmx0MtFUh0NHGyGb1%2Fnx%2B1CfF6Q4H9qvjtRJ2akyebGZb9SE8P2bwNMTFjHT8GO75b%2BZNIV5c%2Fz5ArrEWKiuhmEXg83NM2pL9fG3QjmpERCuyX%2F1drqRyA1FRqeB5tbyeOZRAWpkflKmzaND7vL7TQ7bt9WJJoAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIyLTA1LTEwVDIzOjMzOjE5KzAwOjAw7KPZpwAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMi0wNS0xMFQyMzozMzoxOSswMDowMJ3%2BYRsAAAAASUVORK5CYII%3D&style=flat-square">
</a>
</p>

A simple node-based editor for image processing with multiple layers.

Try it out [here](https://node-ip.saurabhagat.me/) !

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

<br/>

## License

[Apache](./LICENSE)

Copyright &copy; 2019-present | Saurabh Bhagat

