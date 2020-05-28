import '../css/app.scss';
const $ = require('jquery');

require('bootstrap');
require('@fortawesome/fontawesome-free/css/all.min.css');
require('@fortawesome/fontawesome-free/js/all.js');



$(document).ready(function() {

        let tableBody = $('tbody');
        let date = new Date();
        let yesterday = new Date(Date.now() - 86400000); 
        let yesterdayString = yesterday.toISOString().substring(0,10);
    
    let ajaxCall = function() {
        $('body').css('cursor', 'wait');
        let yesterdayAjax = $.ajax({
            url:'https://api.nbp.pl/api/exchangerates/tables/a/' + yesterdayString + '/?format=json',
            method:'GET',
            async: false,
            success: function(data) {
                return data;
            },
        })
        let todayAjax = $.ajax({
            url:'https://api.nbp.pl/api/exchangerates/tables/a/today/?format=json',
            method: 'GET',
            async: false,
            success: function(data) {
                return data;
            }
        })
        let data = createMainData(yesterdayAjax.responseJSON[0].rates, todayAjax.responseJSON[0].rates)
        
        
        $(tableBody).empty();
        $.each(data, function(index, value) {
            let changeColor = (value.currencyDiff > 0) ? 'text-success' : 'text-danger';
            $(tableBody).append(`
                <tr>
                    <td class="upperCase">${value.currency}</td>
                    <td>${value.code}</td>
                    <td>${value.mid}</td>
                    <td class="${changeColor}">${value.percentChange.toFixed(2)} %</td>
                    <td class="${changeColor}">${value.currencyDiff.toFixed(2)} zl</td>
                </tr>
            `)
        })
        $('body').css('cursor', 'default');
    }

    ajaxCall();

    $('#refreshResults').on('click', function() {
        removeArrow();
        $('tbody').empty();
        ajaxCall();
    })
     $('th').click(function(){
        var table = $(this).parents('table').eq(0)
        var rows = table.find('tr:gt(0)').toArray().sort(comparer($(this).index()))
        this.asc = !this.asc
        removeArrow();
        if (!this.asc){
            rows = rows.reverse()
            $(this).find('span').html(' <i class="fas fa-arrow-up"></i>');
        } else {
            $(this).find('span').html(' <i class="fas fa-arrow-down"></i>');
        }
        for (var i = 0; i < rows.length; i++){table.append(rows[i])}
    })
    function comparer(index) {
        return function(a, b) {
            var valA = getCellValue(a, index), valB = getCellValue(b, index)
            return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.toString().localeCompare(valB)
        }
    }
    function getCellValue(row, index){ return $(row).children('td').eq(index).text() }

    let removeArrow =function() {
        $('span').html('');
    }
});

let createMainData = function(yesterdayData, todaysData) {
    let data = [];
    $.each(todaysData, function(index, value) {
        data[index] = {
            'currency': value.currency,
            'code': value.code,
            'mid': value.mid,
            'percentChange': value.mid / yesterdayData[index].mid * 100 - 100,
            'currencyDiff': value.mid - yesterdayData[index].mid,
        };
    })

   return data;
}