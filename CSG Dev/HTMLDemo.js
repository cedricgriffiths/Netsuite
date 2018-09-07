/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       24 Aug 2018     cedricgriffiths
 *
 */

/**
 * @param {nlobjRequest} request Request object
 * @param {nlobjResponse} response Response object
 * @returns {Void} Any output is written via response object
 */
function suitelet(request, response)
{
	var content = '';
	content += "<html>";
	content += "<head>";
	content += "";
	content += "<script src=\"https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js\"></script>";
	content += "<script>";
	content += "$(document).ready(function() {";
	content += "  $('tbody').scroll(function(e) { ";
	content += "    $('thead').css(\"left\", -$(\"tbody\").scrollLeft()); ";
	content += "    $('thead th:nth-child(1)').css(\"left\", $(\"tbody\").scrollLeft()); ";
	content += "    $('tbody td:nth-child(1)').css(\"left\", $(\"tbody\").scrollLeft()); ";
	content += "  });";
	content += "});";
	content += "</script>";
	content += "";
	content += "<style type=\"text/css\">";
	content += "table {";
	content += "  position: relative;";
	content += "  width: 750px;";
	content += "  background-color: #aaa;";
	content += "  overflow: hidden;";
	content += "  border-collapse: collapse;";
	content += "}";
	content += "";
	content += "";
	content += "/*thead*/";
	content += "thead {";
	content += "  position: relative;";
	content += "  display: block; ";
	content += "  width: 750px;";
	content += "  overflow: visible;";
	content += "}";
	content += "";
	content += "thead th {";
	content += "  background-color: #ffffff; ";
	content += "  min-width: 120px;";
	content += "  height: 32px;";
	content += "  border: 1px solid #222; ";
	content += "}";
	content += "";
	content += "thead th:nth-child(1) {";
	content += "  position: relative;";
	content += "  display: block; ";
	content += "  background-color: #ffffff; ";
	content += "}";
	content += "tbody {";
	content += "  position: relative;";
	content += "  display: block;";
	content += "  width: 750px;";
	content += "  height: 239px;";
	content += "  overflow: scroll;";
	content += "}";
	content += "";
	content += "tbody td {";
	content += "  background-color: #ffffff; ";
	content += "  min-width: 120px;";
	content += "  border: 1px solid #222; ";
	content += "}";
	content += "";
	content += "tbody tr td:nth-child(1) {  ";
	content += "  position: relative;";
	content += "  display: block; ";
	content += "  height: 40px;";
	content += "  background-color: #ffffff; ";
	content += "}";
	content += "";
	content += "</style>";
	content += "</head>";
	content += "";
	content += "<body>";
	content += "  <table>";
	content += "    <thead>";
	content += "      <tr>";
	content += "        <th>Name</th>";
	content += "        <th>Town</th>";
	content += "        <th>County</th>";
	content += "        <th>Age</th>";
	content += "        <th>Profession</th>";
	content += "        <th>Anual Income</th>";
	content += "        <th>Matital Status</th>";
	content += "        <th>Children</th>";
	content += "      </tr>";
	content += "    </thead>";
	content += "    <tbody>";
	content += "      <tr>";
	content += "        <td>John Smith</td>";
	content += "        <td>Macelsfield</td>";
	content += "        <td>Cheshire</td>";
	content += "        <td>52</td>";
	content += "        <td>Brewer</td>";
	content += "        <td>£47,000</td>";
	content += "        <td>Married</td>";
	content += "        <td>2</td>";
	content += "      </tr>";
	content += "      <tr>";
	content += "        <td>Jenny Jones</td>";
	content += "        <td>Threlkeld</td>";
	content += "        <td>Cumbria</td>";
	content += "        <td>34</td>";
	content += "        <td>Shepherdess</td>";
	content += "        <td>£28,000</td>";
	content += "        <td>Single</td>";
	content += "        <td>0</td>";
	content += "      </tr>";
	content += "      <tr>";
	content += "        <td>Peter Frampton</td>";
	content += "        <td>Avebury</td>";
	content += "        <td>Wiltshire</td>";
	content += "        <td>57</td>";
	content += "        <td>Musician</td>";
	content += "        <td>£124,000</td>";
	content += "        <td>Married</td>";
	content += "        <td>4</td>";
	content += "      </tr>";
	content += "      <tr>";
	content += "        <td>Simon King</td>";
	content += "        <td>Malvern</td>";
	content += "        <td>Worchestershire</td>";
	content += "        <td>48</td>";
	content += "        <td>Naturalist</td>";
	content += "        <td>£65,000</td>";
	content += "        <td>Married</td>";
	content += "        <td>2</td>";
	content += "      </tr>";
	content += "      <tr>";
	content += "        <td>Lucy Diamond</td>";
	content += "        <td>St Albans</td>";
	content += "        <td>Hertfordshire</td>";
	content += "        <td>67</td>";
	content += "        <td>Pharmasist</td>";
	content += "        <td>Retired</td>";
	content += "        <td>Married</td>";
	content += "        <td>3</td>";
	content += "      </tr>";
	content += "      <tr>";
	content += "        <td>Austin Stevenson</td>";
	content += "        <td>Edinburgh</td>";
	content += "        <td>Lothian </td>";
	content += "        <td>36</td>";
	content += "        <td>Vigilante</td>";
	content += "        <td>£86,000</td>";
	content += "        <td>Single</td>";
	content += "        <td>Unknown</td>";
	content += "      </tr>";
	content += "      <tr>";
	content += "        <td>Wilma Rubble</td>";
	content += "        <td>Bedford</td>";
	content += "        <td>Bedfordshire</td>";
	content += "        <td>43</td>";
	content += "        <td>Housewife</td>";
	content += "        <td>N/A</td>";
	content += "        <td>Married</td>";
	content += "        <td>1</td>";
	content += "      </tr>";
	content += "      <tr>";
	content += "        <td>Kat Dibble</td>";
	content += "        <td>Manhattan</td>";
	content += "        <td>New York</td>";
	content += "        <td>55</td>";
	content += "        <td>Policewoman</td>";
	content += "        <td>$36,000</td>";
	content += "        <td>Single</td>";
	content += "        <td>1</td>";
	content += "      </tr>";
	content += "      <tr>";
	content += "        <td>Henry Bolingbroke</td>";
	content += "        <td>Bolingbroke</td>";
	content += "        <td>Lincolnshire</td>";
	content += "        <td>45</td>";
	content += "        <td>Landowner</td>";
	content += "        <td>Lots</td>";
	content += "        <td>Married</td>";
	content += "        <td>6</td>";
	content += "      </tr>";
	content += "      <tr>";
	content += "        <td>Alan Brisingamen</td>";
	content += "        <td>Alderley</td>";
	content += "        <td>Cheshire</td>";
	content += "        <td>352</td>";
	content += "        <td>Arcanist</td>";
	content += "        <td>A pile of gems</td>";
	content += "        <td>Single</td>";
	content += "        <td>0</td>";
	content += "      </tr>";
	content += "    </tbody>";
	content += "  </table>";
	content += "</body>";
	content += "";
	content += "</html>";
	
	response.write(content);
}