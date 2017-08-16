/**
 *@NApiVersion 2.x
 *@NScriptType Suitelet
 */
define(['N/ui/serverWidget'],
    function(serverWidget) {
        function onRequest(context) {
            if (context.request.method === 'GET') {
                var form = serverWidget.createForm({
                    title: 'Simple Form',
                    hideNavBar: true
                });
                var field = form.addField({
                    id: 'textfield',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Text'
                });
                field.layoutType = serverWidget.FieldLayoutType.NORMAL;
                field.breakType = serverWidget.FieldBreakType.STARTCOL;
                form.addField({
                    id: 'datefield',
                    type: serverWidget.FieldType.DATE,
                    label: 'Date'
                });
                form.addField({
                    id: 'currencyfield',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'Currency'
                });
                var select = form.addField({
                    id: 'selectfield',
                    type: serverWidget.FieldType.SELECT,
                    label: 'Select'
                });
                select.addSelectOption({
                    value: 'a',
                    text: 'Albert'
                });
                select.addSelectOption({
                    value: 'b',
                    text: 'Baron'
                });
                var sublist = form.addSublist({
                    id: 'sublist',
                    type: serverWidget.SublistType.INLINEEDITOR,
                    label: 'Inline Editor Sublist'
                });
                sublist.addField({
                    id: 'sublist1',
                    type: serverWidget.FieldType.DATE,
                    label: 'Date'
                });
                sublist.addField({
                    id: 'sublist2',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Text'
                });
                form.addSubmitButton({
                    label: 'Submit Button'
                });

                context.response.writePage(form);
            } else {
                var delimiter = /\u0001/;
                var textField = context.request.parameters.textfield;
                var dateField = context.request.parameters.datefield;
                var currencyField = context.request.parameters.currencyfield;
                var selectField = context.request.parameters.selectfield;
                var sublistData = context.request.parameters.sublistdata.split(delimiter);
                var sublistField1 = sublistData[0];
                var sublistField2 = sublistData[1];

                context.response.write('You have entered: ' + textField + ' ' + dateField + ' ' 
                    + currencyField + ' ' + selectField + ' ' + sublistField1 + ' ' + sublistField2);
            }
        }

        return {
            onRequest: onRequest
        };
    });