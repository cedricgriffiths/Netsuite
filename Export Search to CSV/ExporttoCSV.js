/**
 * Saved Search results to CSV
 * @type {{convertToCSV}}
 */

function OutputToCSV() {

	var SavedSearchResultConverter = (function() {
		return {
		/**
		 * Executes given saved search and converts its result to your separator separated values
		 * @param searchId The search to execute
		 * @param includeHeader true / false to tell if headers should be included or not
		 * @returns {*}
		 */
		convertToCSV : function(searchId, includeHeader) {
			var contents = '';
			var searchResult = nlapiSearchRecord(null, searchId, null, null);

			if (!searchResult || searchResult.length <= 0) {
				throw new Error('No result returned after executing search.');
			}

			// Creating some array's that will be populated from the saved search results
			var content = [];
			var temp = [];
			var x = 0;

			if (includeHeader === true) {
				var firstResult = searchResult[0];
				// Returns an array of column internal Ids
				var basicColumns = firstResult.getAllColumns();

				for (var c = 0; c < basicColumns.length; c++) {
					temp[c] = basicColumns[c].getName();
				}

				content[x] = temp;
				x++;
			}
			temp = [];
			// Looping through the search Results
			for (var i = 0; i < searchResult.length; i++) {
				var resultSet = searchResult[i];
				// Returns an array of column internal Ids
				var columns = resultSet.getAllColumns();

				// Looping through each column and assign it to the temp array
				for (var y = 0; y < columns.length; y++) {

					var colValue = resultSet.getValue(columns[y]);
					var colText = resultSet.getText(columns[y]);

					if (colText) {
						temp[y] = '"' + colText + '"';
					}
					else {
						temp[y] = '"' + colValue + '"';
					}
					//temp[y] = (!!resultSet.getValue(columns[y]) ? resultSet.getValue(columns[y]) : resultSet.getText(columns[y]));

				}
				// Taking the content of the temp array and assigning it to the Content Array.
				content[x] = temp;
				temp = [];
				x++;
			}

			// Looping through the content array and assigning it to the contents string variable.
			for (var z = 0; z < content.length; z++) {
				contents += content[z].toString() + '\n';
			}

			return contents;
		}
		};
	})();

	var results = SavedSearchResultConverter.convertToCSV(179, true);

	var outputFile = nlapiCreateFile('SearchResults.csv', 'CSV', results);

	nlapiSendEmail(nlapiGetUser(), 'cedric.griffiths@brightbridgesolutions.com', 'CSV Export', 'CSV Export file', null, null, null, outputFile, false, false, null);

}
